import type { PrismaClient } from '@prisma/client';

import prisma from '@/src/utils/db';

import {
	AUTH_GUARD,
	BAN_ENFORCED,
	QUOTA_ENFORCED,
	type RateLimit
} from './policy';
import { redisCommand } from './redis';

/**
 * Plafonnement des open API et garde anti-force brute.
 *
 * Redis porte la décision temps réel, Postgres la trace durable. Tout est en
 * dégradation ouverte : si Redis ne répond pas, on laisse passer. Voir
 * `docs/open-api-protection.md`.
 */

const MINUTE_MS = 60_000;

// ── Quota par clé et par route ───────────────────────────────────────────────

/**
 * Fenêtre glissante, en un aller-retour atomique.
 *
 * Un ensemble trié par (clé, route) : chaque appel y dépose un membre horodaté,
 * on purge ce qui est sorti de la fenêtre, on compte. Plus juste qu'une fenêtre
 * fixe, qui laisse passer deux fois le plafond à cheval sur deux fenêtres.
 *
 * Quand l'appel est refusé et que le plafond est appliqué, on **n'ajoute pas** le
 * membre : sinon un appelant qui martèle maintiendrait sa propre fenêtre pleine
 * indéfiniment. En mode observation on ajoute toujours, pour mesurer le volume
 * réel.
 */
const QUOTA_SCRIPT = `
local key     = KEYS[1]
local now     = tonumber(ARGV[1])
local window  = tonumber(ARGV[2])
local max     = tonumber(ARGV[3])
local member  = ARGV[4]
local enforce = tonumber(ARGV[5])

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

local count   = redis.call('ZCARD', key)
local blocked = 0
if count >= max then blocked = 1 end

if blocked == 0 or enforce == 0 then
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window)
end

local oldest  = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local resetAt = now + window
if oldest[2] then resetAt = tonumber(oldest[2]) + window end

return { blocked, count, resetAt }
`;

export type QuotaVerdict = {
	wouldBlock: boolean;
	limit: number;
	remaining: number;
	resetAt: number;
	retryAfterSeconds: number;
};

/**
 * `null` quand il n'y a pas de plafond sur la route, ou quand Redis n'a pas
 * répondu — dans les deux cas l'appel passe sans restriction.
 */
export const checkQuota = async (
	apiKeyId: number,
	route: string,
	limit: RateLimit | null
): Promise<QuotaVerdict | null> => {
	if (!limit) return null;

	const now = Date.now();
	const member = `${now}-${Math.random().toString(36).slice(2, 10)}`;

	const raw = await redisCommand<unknown>(
		client =>
			client.eval(
				QUOTA_SCRIPT,
				1,
				`rl:${apiKeyId}:${route}`,
				now,
				limit.windowMs,
				limit.max,
				member,
				QUOTA_ENFORCED ? 1 : 0
			),
		null
	);

	if (!Array.isArray(raw)) return null;

	const [blocked, count, resetAt] = raw as [number, number, number];
	const used = blocked === 1 ? count : count + 1;

	return {
		wouldBlock: blocked === 1,
		limit: limit.max,
		remaining: Math.max(0, limit.max - used),
		resetAt,
		retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000))
	};
};

export const quotaEnforced = () => QUOTA_ENFORCED;

/**
 * En-têtes standards de plafonnement, posés même quand l'appel passe : c'est ce
 * qui permet à un partenaire de s'auto-réguler au lieu de découvrir la limite en
 * se prenant un 429.
 */
export const rateLimitHeaders = (
	verdict: QuotaVerdict
): Record<string, string> => ({
	'X-RateLimit-Limit': String(verdict.limit),
	'X-RateLimit-Remaining': String(verdict.remaining),
	'X-RateLimit-Reset': String(Math.ceil(verdict.resetAt / 1000)),
	...(verdict.wouldBlock
		? { 'Retry-After': String(verdict.retryAfterSeconds) }
		: {})
});

// ── Bannissement d'IP ────────────────────────────────────────────────────────

/**
 * Cache de processus des bannissements enregistrés en base.
 *
 * Redis reste le chemin normal. Ce cache couvre les deux cas où il ne suffit
 * pas : un redémarrage de Redis qui perd les clés, et un bannissement posé à la
 * main par un agent. Rafraîchi en tâche de fond, jamais sur le chemin critique.
 */
let bannedIps = new Set<string>();
let bannedRefreshedAt = 0;

const BAN_CACHE_TTL_MS = 60_000;

const refreshBannedIps = async (db: PrismaClient) => {
	if (Date.now() - bannedRefreshedAt < BAN_CACHE_TTL_MS) return;

	// Posé avant l'attente : deux requêtes simultanées ne doivent pas déclencher
	// deux rafraîchissements.
	bannedRefreshedAt = Date.now();

	try {
		const rows = await db.apiIpBan.findMany({
			where: { expires_at: { gt: new Date() }, lifted_at: null },
			select: { ip: true }
		});

		bannedIps = new Set(rows.map(row => row.ip));
	} catch (error) {
		console.error('[open-api-limits] rechargement des bans impossible', error);
	}
};

export const isIpExempt = (ip: string) => AUTH_GUARD.exemptIps.includes(ip);

/**
 * Cette IP est-elle bannie ?
 *
 * Ne bloque jamais sur Postgres : le rafraîchissement du cache est lancé sans
 * être attendu. Une fraîcheur à la minute est largement suffisante pour un
 * bannissement qui dure au minimum un quart d'heure.
 */
export const isIpBanned = async (
	ip: string,
	db: PrismaClient = prisma
): Promise<boolean> => {
	if (isIpExempt(ip)) return false;

	const inRedis = await redisCommand(client => client.exists(`ban:${ip}`), 0);
	if (inRedis === 1) return true;

	void refreshBannedIps(db);

	return bannedIps.has(ip);
};

export const banEnforced = () => BAN_ENFORCED;

export type BanResult = {
	strike: number;
	minutes: number;
	expiresAt: Date;
};

/**
 * Bannit une IP, dans Redis pour l'application immédiate et en base pour la
 * trace. Réutilisable pour un bannissement manuel — d'où `createdBy`.
 */
export const banIp = async (
	ip: string,
	reason: string,
	strike: number,
	db: PrismaClient = prisma,
	createdBy = 'auto'
): Promise<BanResult> => {
	const index = Math.min(strike - 1, AUTH_GUARD.banMinutes.length - 1);
	const minutes = AUTH_GUARD.banMinutes[index];
	const durationMs = minutes * MINUTE_MS;
	const expiresAt = new Date(Date.now() + durationMs);

	await redisCommand(
		client => client.set(`ban:${ip}`, String(strike), 'PX', durationMs),
		null
	);
	await redisCommand(client => client.del(`bf:${ip}`), 0);

	bannedIps.add(ip);

	try {
		await db.apiIpBan.create({
			data: { ip, reason, strike, expires_at: expiresAt, created_by: createdBy }
		});
	} catch (error) {
		console.error('[open-api-limits] ban non enregistré en base', error);
	}

	return { strike, minutes, expiresAt };
};

/** Levée manuelle : la ligne est neutralisée, pas supprimée. */
export const liftBan = async (
	ip: string,
	liftedBy: string,
	db: PrismaClient = prisma
): Promise<number> => {
	await redisCommand(client => client.del(`ban:${ip}`, `bf:${ip}`), 0);

	bannedIps.delete(ip);
	bannedRefreshedAt = 0;

	const { count } = await db.apiIpBan.updateMany({
		where: { ip, lifted_at: null, expires_at: { gt: new Date() } },
		data: { lifted_at: new Date(), lifted_by: liftedBy }
	});

	return count;
};

/**
 * Comptabilise un échec d'authentification et bannit au seuil.
 *
 * Appelé depuis la journalisation, au moment où elle constate un 401 : c'est le
 * seul point d'observation, donc aucun risque que compteur et journal divergent.
 *
 * Les 404 ne passent pas par ici — un scanner qui tape des chemins au hasard
 * n'essaie pas de deviner une clé.
 */
export const recordAuthFailure = async (
	ip: string,
	db: PrismaClient = prisma
): Promise<BanResult | null> => {
	if (isIpExempt(ip)) return null;

	const failures = await redisCommand(async client => {
		const count = await client.incr(`bf:${ip}`);
		if (count === 1) await client.pexpire(`bf:${ip}`, AUTH_GUARD.windowMs);
		return count;
	}, 0);

	// Redis muet : le compteur retombe à 0, donc aucun bannissement. Dégradation
	// ouverte assumée.
	if (failures < AUTH_GUARD.maxFailures) return null;

	const strike = await redisCommand(async client => {
		const count = await client.incr(`strikes:${ip}`);
		await client.pexpire(`strikes:${ip}`, AUTH_GUARD.strikeTtlMs);
		return count;
	}, 1);

	const windowMinutes = Math.round(AUTH_GUARD.windowMs / MINUTE_MS);

	return banIp(
		ip,
		`${failures} échecs d'authentification en ${windowMinutes} min`,
		strike,
		db
	);
};

// ── Journalisation des appels rejetés ────────────────────────────────────────

const banHits = new Map<string, number>();

/**
 * Une IP bannie qui martèle ne doit pas provoquer une écriture Postgres par
 * requête : le mécanisme anti-abus deviendrait lui-même le vecteur d'abus. On
 * garde le premier rejet puis un sur vingt.
 *
 * Compteur de processus, volontairement : il n'a pas besoin d'être exact, et le
 * faire passer par Redis ajouterait un aller-retour sur un chemin qu'on cherche
 * justement à rendre gratuit.
 */
export const shouldLogBannedHit = (ip: string): boolean => {
	const hits = (banHits.get(ip) ?? 0) + 1;

	// Garde-fou mémoire : au-delà, on repart de zéro plutôt que de croître.
	if (banHits.size > 10_000) banHits.clear();

	banHits.set(ip, hits);

	return hits === 1 || hits % 20 === 0;
};
