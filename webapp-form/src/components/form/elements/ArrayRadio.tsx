import { FormField, Opinion, RadioOption } from '@/src/utils/types';
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

export const ArrayRadio = (props: Props) => {
	const { field, opinion, setOpinion, form } = props;
	const { classes, cx } = useStyles({ nbItems: 2 });

	const { t } = useTranslation('common');

	function getFirstTwoWords(str: string) {
		const words = str.split(/\s+/); // Divise la chaîne par tout espace blanc
		const firstTwoWords = words.slice(0, 2); // Prend les deux premiers mots
		return firstTwoWords.join(' '); // Rejoint les deux mots avec un espace
	}

	let variablePrefix = '[id]';

	function escapeRegex(string: string) {
		return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	// Création de l'expression régulière avec un préfixe variable
	let pattern = new RegExp(escapeRegex(variablePrefix) + '_17');

	// Fonction pour vérifier la présence d'un élément avec le motif variable suivi de "_17"
	function containsPattern(array: string[], pattern: RegExp) {
		return array.some(element => pattern.test(element));
	}

	if (field.kind === 'array-radio') {
		return (
			<>
				{containsPattern(
					opinion.contact_reached,
					new RegExp(escapeRegex(''.toString()) + '_17'),
				) ? (
					<>
						<div className={cx(fr.cx('fr-col-12'), classes.reviewContainer)}>
							<div className={cx(classes.reviews)}>
								<h3>{t(field.label)}</h3>
								<p className={fr.cx('fr-hint-text', 'fr-mb-6v')}>
									{t(field.hint ?? '')}
								</p>

								{'options' in form[0] &&
									form[0].options &&
									form[0].options.map(
										(option: RadioOption, outerIndex: number) => (
											<div className={cx(classes.optionRow)} key={option.value}>
												{(field.needed.includes(option.value) ||
													(opinion.contact_tried.includes(option.value) &&
														!field.excluded.includes(option.value))) &&
													containsPattern(
														opinion.contact_reached,
														new RegExp(
															escapeRegex(option.value.toString()) + '_17',
														),
													) && (
														<>
															<div className={cx(classes.labelWrapper)}>
																<label
																	className={cx(classes.label)}
																	htmlFor={`mobile-radio-${outerIndex}`}
																>
																	{getFirstTwoWords(t(option.label))}
																</label>
															</div>
															<ul>
																{field.options.map((opt, innerIndex) => (
																	<li key={innerIndex}>
																		<input
																			type="radio"
																			id={`mobile-radio-${outerIndex}-${innerIndex}`}
																			name={`mobile-radio-${outerIndex}`}
																			value={`value-${outerIndex}`}
																			checked={opinion.contact_satisfaction.includes(
																				escapeRegex(option.value.toString()) +
																					'_' +
																					opt.value,
																			)}
																			onChange={event => {
																				setOpinion({
																					...opinion,
																					contact_satisfaction: [
																						...opinion.contact_satisfaction.filter(
																							cs =>
																								!cs.includes(
																									escapeRegex(
																										option.value.toString(),
																									),
																								),
																						),
																						escapeRegex(
																							option.value.toString(),
																						) +
																							'_' +
																							opt.value,
																					],
																				});
																			}}
																			onClick={() => {
																				// if the value is already selected, remove it
																				if (
																					opinion.contact_satisfaction.includes(
																						escapeRegex(
																							option.value.toString(),
																						) +
																							'_' +
																							opt.value,
																					)
																				) {
																					setOpinion({
																						...opinion,
																						contact_satisfaction:
																							opinion.contact_satisfaction.filter(
																								cs =>
																									cs !==
																									escapeRegex(
																										option.value.toString(),
																									) +
																										'_' +
																										opt.value,
																							),
																					});
																				}
																			}}
																		/>
																		<label
																			htmlFor={`mobile-radio-${outerIndex}-${innerIndex}`}
																			className={cx(classes.reviewInputLabel)}
																		>
																			{t(opt.label)}
																		</label>
																	</li>
																))}
															</ul>
														</>
													)}
											</div>
										),
									)}
							</div>
						</div>
					</>
				) : (
					<></>
				)}
			</>
		);
	}
};

const useStyles = tss
	.withName(ArrayRadio.name)
	.withParams<{ nbItems: number }>()
	.create(({ nbItems }) => ({
		smallText: {
			fontSize: '0.8rem',
			color: fr.colors.decisions.text.disabled.grey.default,
		},
		bgWhite: {
			background: 'white !important',
		},
		headerLabels: {
			fontWeight: 'normal !important',
			...fr.typography[17].style,
			'&:last-child': {
				paddingLeft: '3rem',
			},
		},
		labelWrapper: {
			paddingBottom: fr.spacing('4v'),
		},
		label: {
			...fr.typography[19].style,
		},
		radioWrapper: {
			padding: '0 !important',
		},
		reviewContainer: {
			['input:checked + label']: {
				borderColor: fr.colors.decisions.background.flat.blueFrance.default,
				backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
				color: 'white',
			},
			['.fr-radio-group input[type=radio] + label::before']: {
				content: 'none',
				outline: 'none',
				boxShadow: 'none',
				border: 'none',
			},
			['input:focus-visible + label']: {
				outlineOffset: '2px',
				outline: '2px solid #4D90FE',
			},
		},
		optionRow: {
			background: 'white !important',
		},
		reviews: {
			ul: {
				display: 'flex',
				flexDirection: 'row',
				flexWrap: 'wrap',
				listStyle: 'none',
				...fr.spacing('margin', { topBottom: 0, rightLeft: 0 }),
				marginBottom: fr.spacing('6v'),
				paddingLeft: 0,
				li: {
					flex: 1,
					paddingBottom: 0,
					marginBottom: fr.spacing('3v'),

					minWidth: '100%',
					':last-child': {
						marginBottom: 0,
					},
					input: {
						position: 'absolute',
						opacity: 0,
						width: 0,
						height: 0,
					},
				},
				'::-webkit-scrollbar': {
					display: 'none',
				},
				[fr.breakpoints.up('md')]: {
					flexWrap: 'nowrap',
					li: {
						minWidth: 'initial',
						marginBottom: 0,
						marginRight: fr.spacing('3v'),
						':last-child': {
							marginRight: 0,
						},
					},
				},
			},
		},
		mainTable: {
			[fr.breakpoints.down('sm')]: {
				display: 'none',
			},
			width: '100%',
			borderCollapse: 'collapse',
			tableLayout: 'fixed',
			'th, tr': {
				borderBottom: '1px solid lightgray',
			},
			th: {
				textAlign: 'center',
			},
			'th:first-of-type, td:first-of-type': {
				width: '10rem',
			},
			'th:last-child, td:last-child': {
				width: '10rem',
			},
			'th:not(:first-of-type):not(:last-child)': {
				minWidth: 'calc((100% - 20rem) / 6)',
			},
		},
		reviewInputLabel: {
			border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
			...fr.spacing('padding', { topBottom: '2v', rightLeft: '4v' }),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center',
			cursor: 'pointer',
			height: '100%',
			fontWeight: 500,
			color: fr.colors.decisions.background.flat.blueFrance.default,
			['&:hover']: {
				borderColor: fr.colors.decisions.background.alt.grey.active,
			},
		},
	}));
