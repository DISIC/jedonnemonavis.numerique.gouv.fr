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
			{block.isRequired && (
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
								className={cx(classes.inputIndicator)}
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
									src={smiley.img}
									alt={smiley.label}
									width={56}
									height={56}
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
			padding: fr.spacing('4v'),
			display: 'flex',
			flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      alignItems: "center",
      gap: fr.spacing("4v"),
			cursor: 'pointer',
			['&:hover']: {
				borderColor: fr.colors.decisions.background.alt.grey.active
			},
			[fr.breakpoints.up('md')]: {
				padding: fr.spacing("4v"),
        paddingLeft: fr.spacing("16v"),
        paddingRight: fr.spacing("16v"),
				img: {
					marginRight: 0
				}
			}
		},
		inputIndicator: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      left: "5%",
      height: "1rem",
      width: "1rem",
      accentColor: fr.colors.decisions.background.flat.blueFrance.default,
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
				width: '100%',
				li:{
          position: "relative",
          paddingBottom: 0,
					marginBottom: fr.spacing("4v"),
          ':last-child': {
            marginBottom: 0,
          },
        }
			},
			[fr.breakpoints.up('md')]: {
				ul: {
					columns: nbItems
				}
			}
		}
	}));

export default Smiley;
