import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react';
import { useState } from 'react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
}

const Mark = (props: Props) => {
	const { block } = props;
	const { classes, cx } = useStyles({ nbItems: block.options.length });

	const [current, setCurrent] = useState<string | null>(null);

	const handleChange = (value: string) => {
		setCurrent(value);
	};

	return (
		<div className={cx(classes.container)}>
			<div className={fr.cx('fr-grid-row')}>
				<div className={fr.cx('fr-col-12')}>
					<div className={cx(classes.radioContainer)}>
						<div>{'Pas clair du tout'}</div>
						<fieldset className={cx(classes.fieldset, fr.cx('fr-fieldset'))}>
							{block.content && (
								<legend>
									<p className={fr.cx('fr-hint-text')}>{block.content}</p>
								</legend>
							)}
							<ul>
								{block.options.map(option => (
									<li key={option.value}>
										<input
											id={`radio-${option.label}-${option.value}`}
											className={fr.cx('fr-sr-only')}
											type="radio"
											name="mark"
											value={option.value || ''}
											checked={current === option.value}
											onChange={() => handleChange(option.value)}
										/>
										<label
											htmlFor={`radio-${option.label}-${option.value}`}
											className={cx(classes.radioInput)}
										>
											{option.label}
										</label>
									</li>
								))}
							</ul>
						</fieldset>
						<div>{'Très clair'}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss
	.withName(Mark.name)
	.withParams<{ nbItems: number }>()
	.create(({ nbItems }) => ({
		container: {
			marginTop: fr.spacing('8v')
		},
		smallText: {
			fontSize: '0.8rem',
			margin: '0 0 10px 0',
			color: fr.colors.decisions.text.mention.grey.default
		},
		radioContainer: {
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			marginTop: fr.spacing('10v'),
			['input:checked + label']: {
				borderColor: fr.colors.decisions.background.flat.blueFrance.default
			},
			['input:focus-visible + label']: {
				outlineOffset: '2px',
				outline: '2px solid #4D90FE'
			},
			[fr.breakpoints.down('md')]: {
				flexDirection: 'column'
			},
			[fr.breakpoints.up('md')]: {
				marginTop: fr.spacing('6v')
			}
		},
		radioInput: {
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
				width: '3.5rem',
				padding: fr.spacing('1v'),
				img: {
					marginTop: fr.spacing('2v'),
					marginRight: 0
				}
			}
		},
		fieldset: {
			width: '100%',
			position: 'initial',
			justifyContent: 'center',
			marginLeft: fr.spacing('4v'),
			marginRight: fr.spacing('4v'),
			marginTop: 0,
			marginBottom: 0,
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
			},
			legend: {
				position: 'absolute',
				top: '-55px',
				[fr.breakpoints.up('md')]: {
					left: 0,
					top: 'unset',
					bottom: '45px'
				}
			}
		}
	}));

export default Mark;
