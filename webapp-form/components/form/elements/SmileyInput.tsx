import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Feeling } from '@/utils/types';

type Props = {
	label: string;
	name: string;
	hint?: string;
	onChange: (smileySelected: Feeling) => void;
};

type Smiley = {
	label: string;
	value: Feeling;
	alt: string;
	img: string;
	imgSelected: string;
};

const smileys: Smiley[] = [
	{
		label: 'Pas bien',
		value: 'bad',
		alt: 'Pas bien',
		img: '/assets/smileys/bad.svg',
		imgSelected: '/assets/smileys/bad-selected.svg'
	},
	{
		label: 'Moyen',
		value: 'medium',
		alt: 'Moyen',
		img: '/assets/smileys/medium.svg',
		imgSelected: '/assets/smileys/medium-selected.svg'
	},
	{
		label: 'Très bien',
		value: 'good',
		alt: 'Très bien',
		img: '/assets/smileys/good.svg',
		imgSelected: '/assets/smileys/good-selected.svg'
	}
];

export const SmileyInput = (props: Props) => {
	const { classes, cx } = useStyles({ nbItems: smileys.length });
	const { label, name, hint, onChange } = props;

	const [smileySelected, setSmileySelected] = useState<Feeling | undefined>(
		undefined
	);

	useEffect(() => {
		if (!!smileySelected) onChange(smileySelected);
	}, [smileySelected]);

	return (
		<div>
			<div className={cx(classes.smileysContainer)}>
				<fieldset className={cx(classes.fieldset, fr.cx('fr-fieldset'))}>
					<legend className={fr.cx('fr-fieldset__legend')}>
						{label}
						{hint && (
							<span className={fr.cx('fr-hint-text', 'fr-mt-2v')}>{hint}</span>
						)}
					</legend>
					<ul>
						{smileys.map(smiley => (
							<li key={smiley.value}>
								<input
									id={`radio-${name}-${smiley.value}`}
									className={fr.cx('fr-sr-only')}
									type="radio"
									name={name}
									onClick={() => {
										setSmileySelected(smiley.value);
									}}
								/>
								<label
									htmlFor={`radio-${name}-${smiley.value}`}
									className={cx(classes.smileyInput)}
								>
									<Image
										alt={smiley.alt}
										src={
											smileySelected === smiley.value
												? smiley.imgSelected
												: smiley.img
										}
										width={38}
										height={38}
									/>
									{smiley.label}
								</label>
							</li>
						))}
					</ul>
				</fieldset>
			</div>
		</div>
	);
};

const useStyles = tss
	.withName(SmileyInput.name)
	.withParams<{ nbItems: number }>()
	.create(({ nbItems }) => ({
		smileysContainer: {
			display: 'flex',
			marginTop: fr.spacing('4v'),
			['input:checked + label']: {
				borderColor: fr.colors.decisions.background.flat.blueFrance.default
			},
			['input:focus-visible + label']: {
				outlineOffset: '2px',
				outline: '2px solid #4D90FE'
			}
		},
		smileyInput: {
			width: '8rem',
			border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
			padding: fr.spacing('1v'),
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			cursor: 'pointer',
			img: {
				marginTop: fr.spacing('2v')
			},
			['&:hover']: {
				borderColor: fr.colors.decisions.background.alt.grey.active
			}
		},
		fieldset: {
			ul: {
				listStyle: 'none',
				...fr.spacing('margin', { topBottom: 0, rightLeft: 0 }),
				paddingLeft: 0,
				columns: nbItems
			}
		}
	}));