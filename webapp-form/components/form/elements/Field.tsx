import { FormField, Opinion } from '@/utils/types';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, SetStateAction } from 'react';
import { SmileyInput } from '../elements/SmileyInput';

type Props = {
	field: FormField;
	opinion: Opinion;
	setOpinion: (value: SetStateAction<Opinion>) => void;
};

export const Field = (props: Props) => {
	const { field, opinion, setOpinion } = props;

	const { t } = useTranslation('common');

	const onChangeCheckbox = (
		key: 'difficulties' | 'help',
		e: ChangeEvent<HTMLInputElement>
	) => {
		setOpinion({
			...opinion,
			[key]: e.target.checked
				? [...opinion[key], e.target.value]
				: opinion[key].filter(d => d !== e.target.value),
			[`${key}_verbatim`]: !e.target.checked
				? undefined
				: opinion[`${key}_verbatim`]
		});
	};

	if (field.condition) {
		// Si la valeur de la source de condition n'est pas encore définie
		if (!opinion[field.condition.name]) return;

		// Si le champ de la source de condition est un Array et qu'il contient la valeur cible
		if (
			Array.isArray(opinion[field.condition.name]) &&
			!opinion[field.condition.name]?.includes(t(field.condition.value))
		)
			return;
		// Si le champ de la source de condition n'est pas un Array et que la valeur n'est pas égale
		else if (
			!Array.isArray(opinion[field.condition.name]) &&
			opinion[field.condition.name] !== t(field.condition.value)
		)
			return;
	}

	switch (field.kind) {
		case 'smiley':
			return (
				<SmileyInput
					label={t(field.label)}
					hint={field.hint ? t(field.hint) : undefined}
					name={field.name}
					onChange={value => {
						setOpinion({ ...opinion, [field.name]: value });
					}}
				/>
			);
		case 'checkbox':
			return (
				<>
					<Checkbox
						legend={t(field.label)}
						options={field.options.map((opt, index) => ({
							label: t(opt.label),
							nativeInputProps: {
								name: opt.name || `${field.name}-${index}`,
								value: t(opt.value),
								onChange: e => {
									onChangeCheckbox(field.name as 'difficulties' | 'help', e);
								}
							}
						}))}
					/>
				</>
			);
		case 'input-textarea':
			return (
				<Input
					hintText={field.hint ? t(field.hint) : undefined}
					label={t(field.label)}
					state="default"
					stateRelatedMessage="Text de validation / d'explication de l'erreur"
					nativeTextAreaProps={{
						value: opinion[field.name],
						onChange: e => {
							setOpinion({
								...opinion,
								[field.name]: e.target.value
							});
						}
					}}
					textArea
				/>
			);
		case 'input-text':
			return (
				<Input
					hintText={field.hint ? t(field.hint) : undefined}
					label={t(field.label)}
					state="default"
					stateRelatedMessage="Text de validation / d'explication de l'erreur"
					nativeInputProps={{
						value: opinion[field.name],
						onChange: e => {
							setOpinion({
								...opinion,
								[field.name]: e.target.value
							});
						}
					}}
				/>
			);
	}
};
