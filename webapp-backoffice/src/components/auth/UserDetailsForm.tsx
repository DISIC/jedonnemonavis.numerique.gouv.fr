import { UserDetails } from '@/prisma/generated/zod';
import { fr } from '@codegouvfr/react-dsfr';
import Input from '@codegouvfr/react-dsfr/Input';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { Autocomplete } from '@mui/material';
import { UserDesignLevel } from '@prisma/client';
import React, { useState } from 'react';
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
];

const UserDetailsForm = () => {
	const { classes, cx } = useStyles();
	const [userDetails, setUserDetails] = useState<UserDetails>({
		level: 'beginner',
		userId: 0,
		jobTitle: '',
		referralSource: '',
		createdAt: new Date(),
		updatedAt: new Date()
	});

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
							<Autocomplete
								id="referral-source-autocomplete"
								disablePortal
								value={userDetails.referralSource || null}
								className={fr.cx('fr-mb-6v')}
								onChange={(_, newValue) => {
									setUserDetails(prev => ({
										...prev,
										referralSource: newValue || ''
									}));
								}}
								renderInput={params => (
									<div
										ref={params.InputProps.ref}
										className={fr.cx('fr-input-group')}
									>
										<Input
											label={
												<p className={fr.cx('fr-mb-0')}>
													Comment avez-vous entendu parler de JDMA ?{' '}
													<span className={cx(classes.asterisk)}>*</span>
												</p>
											}
											iconId="fr-icon-arrow-down-s-line"
											nativeInputProps={{
												...params.inputProps,
												type: 'search',
												required: true,
												placeholder: 'Sélectionner une option'
											}}
										/>
									</div>
								)}
								options={[]} // TODO
								noOptionsText="Aucune organisation trouvée"
							/>
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
