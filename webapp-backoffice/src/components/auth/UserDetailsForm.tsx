import { UserDetails } from '@/prisma/generated/zod';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import Select from '@codegouvfr/react-dsfr/Select';
import { UserDesignLevel } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

const levelMapping: { title: string; value: UserDesignLevel }[] = [
	{
		title: 'Débutant : nous n’avons pas de pratique design structurée',
		value: 'beginner'
	},
	{
		title:
			'Intermédiaire : nous faisons ponctuellement du recueil d’avis ou des tests, sans aide d’un designer',
		value: 'intermediate'
	},
	{
		title:
			'Avancé : nous avons une démarche régulière (tests, analyses, prototypes…)',
		value: 'advanced'
	},
	{
		title:
			'Expert : nous avons une ou plusieurs personnes dédiées au design dans l’équipe',
		value: 'expert'
	}
] as const;

const sourceOptions = [
	'Bouche à oreille / Collègues',
	'Recherche Internet',
	'Réseaux sociaux',
	'Newsletter',
	'Événement ou webinaire',
	"Annuaire des outils de l'État",
	'Démarches simplifiées',
	'Autre (précisez)'
] as const;

type UserDetailsFormProps = {
	onCreated: () => void;
};

const UserDetailsForm = ({ onCreated }: UserDetailsFormProps) => {
	const { classes, cx } = useStyles();
	const { data: session } = useSession();
	const [userDetails, setUserDetails] = useState<UserDetails>({
		level: 'beginner',
		userId: 0,
		jobTitle: '',
		referralSource: '',
		createdAt: new Date(),
		updatedAt: new Date()
	});
	const [customReferralSource, setCustomReferralSource] = useState<string>();

	const createUserDetails = trpc.userDetails.create.useMutation({
		onSuccess: () => onCreated()
	});

	if (session === null) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const userId = parseInt(session?.user.id as string);
		if (!userId) return;
		const detailsToSubmit = {
			...userDetails,
			referralSource:
				userDetails.referralSource === 'Autre (précisez)'
					? customReferralSource || ''
					: userDetails.referralSource,
			userId: userId
		};
		createUserDetails.mutate(detailsToSubmit);
	};

	return (
		<div className={fr.cx('fr-container', 'fr-mt-16v')}>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
				<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
					<div
						className={cx(
							classes.formContainer,
							fr.cx(
								'fr-grid-row',
								'fr-grid-row--center',
								'fr-py-16v',
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
							<h1 className={fr.cx('fr-h2')}>
								Aidez-nous à adapter l’interface à vos besoins !
							</h1>
							<p className={fr.cx('fr-hint-text')}>
								Les champs marqués d&apos;un{' '}
								<span className={cx(classes.asterisk)}>*</span> sont
								obligatoires
							</p>
							<form onSubmit={handleSubmit}>
								<Input
									label="Quel est votre poste ?"
									hintText="Exemple : chef de projet, développeur, designer, product owner, ..."
									nativeInputProps={{
										onChange: e => {
											setUserDetails(prev => ({
												...prev,
												jobTitle: e.target.value
											}));
										},
										value: userDetails.jobTitle || '',
										name: 'jobTitle'
									}}
								/>
								<Select
									label={
										<p className={fr.cx('fr-mb-0')}>
											Comment avez-vous entendu parler de JDMA ?{' '}
											<span className={cx(classes.asterisk)}>*</span>
										</p>
									}
									nativeSelectProps={{
										name: 'referralSource',
										value: userDetails.referralSource,
										onChange: e => {
											const value = e.target.value;
											setUserDetails(prev => ({
												...prev,
												referralSource: value
											}));
										},
										required: true
									}}
								>
									<option value="" selected disabled hidden>
										Selectionnez une option
									</option>
									{sourceOptions.map(option => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</Select>
								{userDetails.referralSource === 'Autre (précisez)' && (
									<Input
										className={fr.cx('fr-mt-4v')}
										label=""
										nativeInputProps={{
											onChange: e => {
												setCustomReferralSource(e.target.value);
											},
											value: customReferralSource,
											name: 'customReferralSource',
											placeholder: 'Veuillez préciser',
											required: true
										}}
									/>
								)}
								<RadioButtons
									name="design-level-radio"
									legend={
										<p>
											Quel est le niveau de maturité design de votre équipe ?{' '}
											<span className={cx(classes.asterisk)}>*</span>
										</p>
									}
									options={levelMapping.map(level => ({
										label: level.title,
										nativeInputProps: {
											value: level.value,
											checked: userDetails.level === level.value,
											onChange: () => {
												setUserDetails(prev => ({
													...prev,
													level: level.value
												}));
											}
										}
									}))}
								/>
								<div className={cx(classes.buttonNext)}>
									<Button>Continuer</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.withName(UserDetailsForm.name).create(() => ({
	formContainer: {
		backgroundColor: fr.colors.decisions.background.alt.grey.default
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
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default UserDetailsForm;
