import { Link, Text } from 'react-email';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaDnCreatorInviteEmailProps } from './interface';

/**
 * Mail spécifique au créateur d'une démarche sur Démarches Numériques, dont le service
 * JDMA + formulaire ont été provisionnés automatiquement. Les autres personnes invitées
 * reçoivent le mail d'invitation classique (JdmaUserInviteEmail).
 */
export const JdmaDnCreatorInviteEmail = ({
	recipientEmail = 'user@example.com',
	inviteToken = 'example-token-123',
	demarcheName = 'Votre démarche',
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaDnCreatorInviteEmailProps) => {
	const link = `${baseUrl}/register?${new URLSearchParams({
		email: recipientEmail,
		inviteToken
	})}`;

	return (
		<JdmaLayout baseUrl={baseUrl}>
			<Text style={paragraph}>Bonjour,</Text>
			<Text style={paragraph}>
				Votre démarche «&nbsp;<strong>{demarcheName}</strong>&nbsp;» a été créée sur
				Démarches Numériques. Un formulaire de satisfaction «&nbsp;
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>
				&nbsp;» a automatiquement été mis en place pour recueillir l&apos;avis des
				usagers à la fin de votre démarche.
			</Text>
			<Text style={paragraph}>
				Pour suivre les résultats et gérer ce formulaire, créez votre compte en
				cliquant sur le lien ci-dessous.
			</Text>
			<Link href={link} target="_blank" style={buttonLink}>
				{link}
			</Link>
			<Text style={paragraph}>
				Vous n&apos;avez aucune configuration à réaliser&nbsp;: le formulaire est déjà
				actif.
			</Text>
		</JdmaLayout>
	);
};

export default JdmaDnCreatorInviteEmail;

// Styles
const paragraph: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	color: '#333333',
	marginBottom: '16px'
};

const linkStyle: React.CSSProperties = {
	color: '#000091',
	textDecoration: 'underline'
};

const buttonLink: React.CSSProperties = {
	color: '#000091',
	textDecoration: 'underline',
	display: 'block',
	marginBottom: '16px',
	wordBreak: 'break-all' as const
};
