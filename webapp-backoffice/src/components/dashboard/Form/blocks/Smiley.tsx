import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { Feeling, smileys } from '@/src/utils/form';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
}

const Smiley = (props: Props) => {
	const { block } = props;
	const { classes, cx } = useStyles({ nbItems: smileys.length });

	const [smileySelected, setSmileySelected] = useState<Feeling | undefined>();

	return (
		<div className={cx(classes.smileysContainer)}>
			{block.required && (
				<span className={fr.cx('fr-hint-text', 'fr-mb-4v')}>
					Ce champ est obligatoire
				</span>
			)}
			<fieldset className={cx(classes.fieldset, fr.cx('fr-fieldset'))}>
				<legend className={fr.cx('fr-fieldset__legend')}>
					{block.content && (
						<span className={fr.cx('fr-hint-text', 'fr-mt-2v')}>
							{block.content}
						</span>
					)}
				</legend>
				<ul>
					{smileys.map(smiley => (
						<li key={smiley.value}>
							<input
								id={`radio-${block.id}-${smiley.value}`}
								className={fr.cx('fr-sr-only')}
								checked={smileySelected === smiley.value}
								onChange={() => {
									setSmileySelected(smiley.value);
								}}
								type="radio"
							/>
							<label
								className={cx(classes.smileyInput)}
								htmlFor={`radio-${block.id}-${smiley.value}`}
								tabIndex={0}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ') {
										setSmileySelected(smiley.value);
									}
								}}
							>
								<Image
									src={
										smileySelected === smiley.value
											? smiley.imgSelected
											: smiley.img
									}
									alt={smiley.label}
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
	);
};

const useStyles = tss
	.withName(Smiley.name)
	.withParams<{ nbItems: number }>()
	.create(({ nbItems }) => ({
		smileysContainer: {
			['input:checked + label']: {
				borderColor: fr.colors.decisions.background.flat.blueFrance.default
			},
			['input:focus-visible + label']: {
				outlineOffset: '2px',
				outline: '2px solid #4D90FE'
			}
		},
		smileyInput: {
			width: '100%',
			border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
			padding: fr.spacing('3v'),
			display: 'flex',
			alignItems: 'center',
			cursor: 'pointer',
			img: {
				marginRight: fr.spacing('2v')
			},
			['&:hover']: {
				borderColor: fr.colors.decisions.background.alt.grey.active
			},
			[fr.breakpoints.up('md')]: {
				flexDirection: 'column',
				width: '8rem',
				padding: fr.spacing('1v'),
				img: {
					marginTop: fr.spacing('2v'),
					marginRight: 0
				}
			}
		},
		fieldset: {
			width: '100%',
			margin: 0,
			padding: 0,
			legend: {
				padding: 0
			},
			ul: {
				listStyle: 'none',
				...fr.spacing('margin', { topBottom: 0, rightLeft: 0 }),
				paddingLeft: 0,
				width: '100%'
			},
			[fr.breakpoints.up('md')]: {
				width: 'initial',
				ul: {
					width: 'initial',
					columns: nbItems
				}
			}
		}
	}));

export default Smiley;
