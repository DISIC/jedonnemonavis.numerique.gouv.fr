import { RegisterForm } from '@/src/components/auth/RegisterForm';
import { AlertObservatoire } from '@/src/components/ui/AlertObservatoire';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Breadcrumb } from '@codegouvfr/react-dsfr/Breadcrumb';
import Button from '@codegouvfr/react-dsfr/Button';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';

type UserPresetInfos = {
	firstName?: string;
	lastName?: string;
	email?: string;
	inviteToken?: string;
};

export default function Register() {
	const router = useRouter();

	const { otp, email, inviteToken, registered, request } = router.query;

	const [isAgentPublic, setIsAgentPublic] = useState<boolean>(false);
	const [redirectForm, setRedirectForm] = useState<boolean>(false);
	const [showNonAgentMessage, setShowNonAgentMessage] =
		useState<boolean>(false);
	const [backgroundColor, setBackgroundColor] = useState<string>(
		fr.colors.decisions.background.alt.grey.default
	);

	const { classes, cx } = useStyles({
		backgroundColor
	});

	const [userPresetInfos, setUserPresetInfos] = useState<UserPresetInfos>({
		email: email as string,
		inviteToken: inviteToken as string
	});

	const { data: getCurrentUser } = trpc.user.me.useQuery(
		{ otp: otp as string },
		{ enabled: !!otp }
	);

	useEffect(() => {
		if (getCurrentUser?.data)
			setUserPresetInfos(getCurrentUser.data as UserPresetInfos);
	}, [getCurrentUser?.data]);

	return (
		<div className={fr.cx('fr-container')}>
			<Head>
				<title>Création de compte | Je donne mon avis</title>
				<meta
					name="description"
					content={`Création de compte | Je donne mon avis`}
				/>
			</Head>
			<Breadcrumb
				currentPageLabel="Création de compte"
				homeLinkProps={{
					href: '/'
				}}
				segments={[]}
			/>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<h1 className={fr.cx('fr-mb-12v')}>Création de compte</h1>
					{/* {!registered && !otp && !request && <AlertObservatoire />} */}
					{!!request && (
						<div role="status">
							<Alert
								className={fr.cx('fr-mb-16v')}
								closable
								description={
									<>
										L'outil JDMA est réservé aux établissements publics. Votre
										adresse e-mail n'est pas reconnue comme une adresse
										d'administration publique. Si vous pensez qu'il s'agit d'une
										erreur, merci de nous décrire votre situation. Nous
										reviendrons vers vous sous 48 heures.
									</>
								}
								onClose={function noRefCheck() {}}
								severity="info"
								title=""
							/>
						</div>
					)}
					<div
						className={cx(
							classes.formContainer,
							fr.cx(
								'fr-grid-row',
								'fr-grid-row--center',
								showNonAgentMessage ? 'fr-py-14v' : 'fr-py-16v',
								'fr-mb-16v'
							)
						)}
					>
						<div
							className={fr.cx(
								'fr-col-12',
								'fr-col-md-8',
								'fr-px-4v',
								'fr-px-md-0'
							)}
						>
							{inviteToken ? (
								<RegisterForm
									userPresetInfos={userPresetInfos}
									otp={otp as string | undefined}
								/>
							) : !redirectForm ? (
								<div>
									<h2>Se créer un compte</h2>
									<RadioButtons
										legend="Êtes-vous agent public ou rattaché à une administration ?"
										name="radio"
										options={[
											{
												label: 'Non',
												nativeInputProps: {
													value: 'no',
													defaultChecked: !isAgentPublic,
													onChange: () => setIsAgentPublic(false)
												}
											},
											{
												label: 'Oui',
												nativeInputProps: {
													value: 'yes',
													onChange: () => setIsAgentPublic(true)
												}
											}
										]}
										state="default"
									/>
									<div className={cx(classes.buttonNext)}>
										<Button
											className={fr.cx('fr-col-12', 'fr-col-md-4')}
											priority="primary"
											onClick={() => {
												if (!isAgentPublic) {
													setBackgroundColor('#F5F5FE');
													setShowNonAgentMessage(true);
												}
												setRedirectForm(true);
											}}
										>
											Continuer
										</Button>
									</div>
								</div>
							) : !isAgentPublic ? (
								<div
									className={fr.cx(
										'fr-grid-row',
										'fr-grid-row--center',
										'fr-grid-row--gutters'
									)}
								>
									<Image
										src="/assets/city-hall.svg"
										alt="Agent public"
										width={120}
										height={120}
										className={fr.cx('fr-col-12', 'fr-col-md-6')}
									/>
									<p className={cx(classes.textLead, fr.cx('fr-text--bold'))}>
										La création de compte est réservée aux agents public.
									</p>
									<p>
										Bonne nouvelle : vous pouvez tout de même partager votre
										avis de manière anonyme sur tous les sites administratifs
										dotés du bouton "Je donne mon avis", sans avoir besoin de
										créer un compte.{' '}
									</p>
									<p>
										Votre avis est très important. Il permet à l'administration
										concernée d'améliorer son service.
									</p>
								</div>
							) : (
								<RegisterForm
									userPresetInfos={userPresetInfos}
									otp={otp as string | undefined}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const useStyles = tss
	.withName(Register.name)
	.withParams<{ backgroundColor: string }>()
	.create(({ backgroundColor }) => ({
		formContainer: {
			backgroundColor,
			[fr.breakpoints.down('md')]: {
				marginLeft: `-${fr.spacing('4v')}`,
				marginRight: `-${fr.spacing('4v')}`
			}
		},
		buttonNext: {
			display: 'flex',
			justifyContent: 'flex-end',
			'& button': {
				textAlign: 'center',
				justifyContent: 'center'
			}
		},
		textLead: {
			textAlign: 'center',
			fontSize: 20,
			fontWeight: 700
		}
	}));
