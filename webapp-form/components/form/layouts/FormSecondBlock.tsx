import { Opinion } from '@/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { ChangeEvent, useState } from 'react';
import { SmileyInput } from '../elements/SmileyInput';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { tss } from 'tss-react/dsfr';

type Props = {
	opinion: Opinion;
	onSubmit: (opinion: Opinion) => void;
};

export const FormSecondBlock = (props: Props) => {
	const { onSubmit, opinion } = props;
	const [tmpOpinion, setTmpOpinion] = useState<Opinion>(opinion);

	const { classes, cx } = useStyles();

	console.log(tmpOpinion.difficulties_verbatim);

	const onChangeCheckbox = (
		key: 'difficulties' | 'help',
		e: ChangeEvent<HTMLInputElement>
	) => {
		setTmpOpinion({
			...tmpOpinion,
			[key]: e.target.checked
				? [...tmpOpinion[key], e.target.value]
				: tmpOpinion[key].filter(d => d !== e.target.value),
			[`${key}_verbatim`]: !e.target.checked
				? undefined
				: tmpOpinion[`${key}_verbatim`]
		});
	};

	return (
		<div>
			<h1 className={fr.cx('fr-mb-14v')}>
				Merci !<br />
				Pouvez-vous nous en dire plus ?
			</h1>
			<form
				onSubmit={e => {
					e.preventDefault();
					onSubmit(tmpOpinion);
				}}
			>
				<div className={cx(classes.field)}>
					<SmileyInput
						label="Était-ce facile à utiliser ?"
						name="easy"
						onChange={value => {
							setTmpOpinion({ ...tmpOpinion, easy: value });
						}}
					/>
				</div>
				<div className={cx(classes.field)}>
					<SmileyInput
						label="Le langage employé était-il facile à comprendre ?"
						name="comprehension"
						onChange={value => {
							setTmpOpinion({ ...tmpOpinion, comprehension: value });
						}}
					/>
				</div>
				<div className={cx(classes.field)}>
					<Checkbox
						legend="Avez-vous rencontré des difficultés ?"
						options={[
							{
								label: "Manque d'informations avant de commencer la démarche",
								nativeInputProps: {
									name: 'difficulty-1',
									value: "Manque d'informations avant de commencer la démarche",
									onChange: e => {
										onChangeCheckbox('difficulties', e);
									}
								}
							},
							{
								label: "La démarche n'a pas fonctionné",
								nativeInputProps: {
									name: 'difficulty-2',
									value: "La démarche n'a pas fonctionné",
									onChange: e => {
										onChangeCheckbox('difficulties', e);
									}
								}
							},
							{
								label: "Le site ne s'affichait pas bien sur mobile",
								nativeInputProps: {
									name: 'difficulty-3',
									value: "Le site ne s'affichait pas bien sur mobile",
									onChange: e => {
										onChangeCheckbox('difficulties', e);
									}
								}
							},
							{
								label: 'Difficulté à joindre les pièces justificatives',
								nativeInputProps: {
									name: 'difficulty-4',
									value: 'Difficulté à joindre les pièces justificatives',
									onChange: e => {
										onChangeCheckbox('difficulties', e);
									}
								}
							},
							{
								label: "Manque d'informations sur la suite, le délai...",
								nativeInputProps: {
									name: 'difficulty-1',
									value: "Manque d'informations sur la suite, le délai...",
									onChange: e => {
										onChangeCheckbox('difficulties', e);
									}
								}
							},
							{
								label: 'Autre',
								nativeInputProps: {
									name: 'difficulty-1',
									value: 'Autre',
									onChange: e => {
										onChangeCheckbox('difficulties', e);
									}
								}
							}
						]}
					/>
				</div>
				{tmpOpinion.difficulties.includes('Autre') && (
					<div className={cx(classes.field)}>
						<Input
							hintText="Maximum 250 caractères."
							label="Pouvez-vous préciser quelle autre difficulté vous avez rencontré ?"
							state="default"
							stateRelatedMessage="Text de validation / d'explication de l'erreur"
							nativeInputProps={{
								value: tmpOpinion.difficulties_verbatim,
								onChange: e => {
									setTmpOpinion({
										...tmpOpinion,
										difficulties_verbatim: e.target.value
									});
								}
							}}
						/>
					</div>
				)}

				<div className={cx(classes.field)}>
					<Checkbox
						legend="De quelle aide avez-vous eu besoin ?"
						options={[
							{
								label: 'Aucune',
								nativeInputProps: {
									name: 'help-1',
									value: 'Aucune',
									onChange: e => {
										onChangeCheckbox('help', e);
									}
								}
							},
							{
								label: 'Un ou une proche',
								hintText: 'Famille, amis...',
								nativeInputProps: {
									name: 'help-2',
									value: 'Un ou une proche',
									onChange: e => {
										onChangeCheckbox('help', e);
									}
								}
							},
							{
								label: 'Une association',
								nativeInputProps: {
									name: 'help-3',
									value: 'Une association',
									onChange: e => {
										onChangeCheckbox('help', e);
									}
								}
							},
							{
								label: 'Un agent public',
								hintText:
									"Santé, enseignement, impôts, force de l'ordre, France services...",
								nativeInputProps: {
									name: 'help-4',
									value: 'Un agent public',
									onChange: e => {
										onChangeCheckbox('help', e);
									}
								}
							},
							{
								label: 'Internet',
								hintText: 'Site, forum...',
								nativeInputProps: {
									name: 'help-5',
									value: 'Un agent public',
									onChange: e => {
										onChangeCheckbox('help', e);
									}
								}
							},
							{
								label: 'Autre',
								nativeInputProps: {
									name: 'help-6',
									value: 'Autre',
									onChange: e => {
										onChangeCheckbox('help', e);
									}
								}
							}
						]}
					/>
				</div>
				{tmpOpinion.help.includes('Autre') && (
					<div className={cx(classes.field)}>
						<Input
							hintText="Maximum 250 caractères."
							label="Pouvez-vous préciser de quelle autre aide vous avez eu besoin ?"
							state="default"
							stateRelatedMessage="Text de validation / d'explication de l'erreur"
							nativeInputProps={{
								value: tmpOpinion.help_verbatim,
								onChange: e => {
									setTmpOpinion({
										...tmpOpinion,
										help_verbatim: e.target.value
									});
								}
							}}
						/>
					</div>
				)}
				<div className={cx(classes.field)}>
					<Input
						label="Souhaitez-vous nous en dire davantage ?"
						nativeTextAreaProps={{
							onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
								setTmpOpinion({ ...tmpOpinion, verbatim: e.target.value });
							},
							value: tmpOpinion.verbatim
						}}
						hintText={
							<>
								Ne communiquez aucune information personnelle ici.
								<br />
								Ceci n’est pas un formulaire de contact. Si vous avez des
								questions sur cette démarche, contactez le service concerné.
							</>
						}
						textArea
					/>
				</div>
				<div className={fr.cx('fr-mt-8v')}>
					<Button type="submit">Valider mon avis</Button>
				</div>
			</form>
		</div>
	);
};

const useStyles = tss
	.withName(SmileyInput.name)
	.withParams()
	.create(() => ({
		field: {
			marginBottom: fr.spacing('14v')
		}
	}));
