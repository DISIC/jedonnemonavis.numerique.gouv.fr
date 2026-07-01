import { FormField, Opinion } from '@/src/utils/types';
import { fr } from '@codegouvfr/react-dsfr';
import { useTranslation } from 'next-i18next';
import { SetStateAction } from 'react';
import { tss } from 'tss-react/dsfr';

type Props = {
	field: FormField;
	opinion: Opinion;
	form: FormField[];
	setOpinion: (value: SetStateAction<Opinion>) => void;
};

export const MarkInput = (props: Props) => {
	const { field, opinion, setOpinion, form } = props;
	const { classes, cx } = useStyles({ nbItems: 5 });

	const { t } = useTranslation('common');

	if (field.kind === 'radio') {
		return (
			<div className={fr.cx('fr-grid-row')}>
				<div className={fr.cx('fr-col-12')}>
					<fieldset className={cx(classes.fieldset, fr.cx('fr-fieldset'))}>
						<legend className={cx(classes.legend)}>
							<h3 className={fr.cx('fr-mb-2v')}>{t(field.label)}</h3>
							{field.hint && (
								<p className={fr.cx('fr-hint-text', 'fr-mb-0')}>
									{t(field.hint)}
								</p>
							)}
						</legend>
						<div className={cx(classes.radioContainer)}>
							<div className={classes.hintLeft}>{t(field.hintLeft ?? '')}</div>
							<ul>
								{field.options.map(f => (
									<li key={f.value}>
										<input
											id={`radio-${f.label}-${f.value}`}
											className={fr.cx('fr-sr-only')}
											type="radio"
											name={field.name}
											checked={opinion.comprehension === f.value}
											onChange={() => {
												setOpinion(prevOpinion => ({
													...prevOpinion,
													[field.name]: f.value
												}));
											}}
											onClick={() => {
												setOpinion(prevOpinion => ({
													...prevOpinion,
													[field.name]:
														prevOpinion[field.name] === f.value
															? undefined
															: f.value
												}));
											}}
										/>
										<label
											htmlFor={`radio-${f.label}-${f.value}`}
											className={cx(classes.radioInput)}
										>
											{t(f.label)}
										</label>
									</li>
								))}
							</ul>
							<div className={classes.hintRight}>
								{t(field.hintRight ?? '')}
							</div>
						</div>
					</fieldset>
				</div>
			</div>
		);
	}
};

const useStyles = tss
	.withName({ MarkInput })
	.withParams<{ nbItems: number }>()
	.create(({ nbItems }) => ({
		legend: {
			float: 'none',
			width: '100%',
			padding: 0,
			marginBottom: fr.spacing('4v')
		},
		hintLeft: {
			marginTop: fr.spacing('6v'),
			marginBottom: fr.spacing('3v'),
			whiteSpace: 'nowrap',
			[fr.breakpoints.up('md')]: {
				margin: 0
			}
		},
		hintRight: {
			whiteSpace: 'nowrap',
			marginTop: fr.spacing('3v'),
			[fr.breakpoints.up('md')]: {
				margin: 0
			}
		},
		radioContainer: {
			display: 'flex',
			alignItems: 'center',
			width: '100%',
			['input:checked + label']: {
				borderColor: fr.colors.decisions.background.flat.blueFrance.default,
				backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
				color: 'white'
			},
			['input:focus-visible + label']: {
				outlineOffset: '2px',
				outline: '2px solid #4D90FE'
			},
			[fr.breakpoints.down('md')]: {
				flexDirection: 'column'
			}
		},
		radioInput: {
			width: '100%',
			border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
			padding: fr.spacing('2v'),
			paddingLeft: fr.spacing('4v'),
			paddingRight: fr.spacing('4v'),
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			cursor: 'pointer',
			color: fr.colors.decisions.background.flat.blueFrance.default,
			fontWeight: 500,
			img: {
				marginRight: fr.spacing('2v')
			},
			['&:hover']: {
				borderColor: fr.colors.decisions.background.alt.grey.active
			},
			[fr.breakpoints.up('md')]: {
				flexDirection: 'column',
				img: {
					marginTop: fr.spacing('2v'),
					marginRight: 0
				}
			}
		},
		fieldset: {
			width: '100%',
			ul: {
				listStyle: 'none',
				...fr.spacing('margin', { topBottom: 0, rightLeft: 0 }),
				paddingLeft: 0,
				width: '100%',
				marginLeft: fr.spacing('4v'),
				marginRight: fr.spacing('4v'),
				li: {
					paddingBottom: 0,
					marginBottom: fr.spacing('3v'),
					':last-child': {
						marginBottom: 0
					}
				}
			},
			[fr.breakpoints.up('md')]: {
				ul: {
					columns: nbItems
				}
			}
		}
	}));
