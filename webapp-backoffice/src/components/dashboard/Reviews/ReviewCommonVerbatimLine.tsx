import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { tss } from 'tss-react/dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { getSeverity } from '@/src/utils/tools';
import { displayIntention, getStatsColor, getStatsIcon } from '@/src/utils/stats';

const ReviewCommonVerbatimLine = ({ review, type }: { review: ExtendedReview, type: 'Line' | 'Verbatim' }) => {
	const { cx, classes } = useStyles();

    console.log('review : ', review)

	if (!review) return null;

	const displayFieldCodeText = (fieldCode: string) => {
		return review.answers?.find(answer => answer.field_code === fieldCode)
			?.answer_text;
	};

	return (
		<div className={cx(classes.container, type === 'Line' && classes.greyContainer)}>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--left'
				)}
			>
				<div className={fr.cx('fr-col-3')}>
					<div>
						<p className={cx(classes.subtitle)}>Difficulté</p>
						{displayFieldCodeText('difficulties') === 'Oui' ? (
							<p className={cx(classes.content)}>
								{review.answers &&
									review.answers
										.filter(
											answer => answer.field_code === 'difficulties_details'
										)
										?.map(
											(el, index, array) => {
                                                return el.answer_text !== 'Autre' ? el.answer_text + (index < array.length - 1 ? ', ' : '.') : ''
                                             }
										)}
                                {review.answers && review.answers.filter(answer => answer.field_code === 'difficulties_details_verbatim').length > 0 &&
                                    <p className={cx(classes.content)}>
                                        Autre : "{review.answers.filter(answer => answer.field_code === 'difficulties_details_verbatim')[0].answer_text || ''}"
                                    </p>
                                }
							</p>
						) : 
							<p className={cx(classes.content)}>
								Non renseigné
							</p>
						}
					</div>
				</div>
				<div className={fr.cx('fr-col-4')}>
					<div>
						<p className={cx(classes.subtitle)}>
							Tentative de contacter le service d'aide ?
						</p>
						
							{displayFieldCodeText('contact') ? (
								<p className={cx(classes.content)}>
									{displayFieldCodeText('contact')}
								</p>

							) : 
								<p className={cx(classes.content)}>
									Non renseigné
								</p>
							}
						
					</div>
					<div>
						<p className={cx(classes.subtitle)}>Résultat de la tentative ?</p>
						{displayFieldCodeText('contact') === 'Oui' ? (
							<p className={cx(classes.content)}>
								{displayFieldCodeText('contact_reached')}
							</p>
						) : (
							<p className={cx(classes.content)}>Non renseigné</p>
						)}
					</div>
					<div>
						<p className={cx(classes.subtitle)}>Moyen(s) de contact ?</p>
						{displayFieldCodeText('contact_reached') === 'Oui' ? (
							<p className={cx(classes.content)}>
								{review.answers &&
									review.answers
										.filter(answer => answer.field_code === 'contact_channels')
										?.map(
											(el, index, array) => {
                                               return el.answer_text !== 'Autre' ? el.answer_text + (index < array.length - 1 ? ', ' : '.') : ''
                                            }
												
										)}
                                
                                {review.answers && review.answers.filter(answer => answer.field_code === 'contact_channels_verbatim').length > 0 &&
                                    <p className={cx(classes.content)}>
                                        Autre : "{review.answers.filter(answer => answer.field_code === 'contact_channels_verbatim')[0].answer_text || ''}"
                                    </p>
                                }
							</p>
						) : (
							<p className={cx(classes.content)}>Non renseigné</p>
						)}
					</div>
                    {review.contact_satisfaction &&
                        <>
                            <p className={cx(classes.subtitle)}>Qualité de l'échange avec le service d'aide</p>
                            <p className={cx(classes.content)}>
                                <Badge
                                    className={cx(classes.badge)}
                                    small={true}
                                    noIcon={true}
                                    severity={getSeverity(review.contact_satisfaction.intention || '')}
                                >
                                    <i
                                        className={fr.cx(
                                            getStatsIcon({
                                                intention: review.contact_satisfaction.intention ?? 'neutral' ?? 'neutral'
                                            })
                                        )}
                                        style={{
                                            color: getStatsColor({
                                                intention: review.contact_satisfaction.intention ?? 'neutral' ?? 'neutral'
                                            })
                                        }}
                                    />
                                    {displayIntention(review.contact_satisfaction.intention ?? 'neutral') ?? 'neutral'}
                                </Badge>
                            </p>
                        </>
                    }
				</div>
				<div className={fr.cx('fr-col-4')}>
					<div>
						<p className={cx(classes.subtitle)}>Autre aide sollicitée ?</p>
						{displayFieldCodeText('help') ? (
							<p className={cx(classes.content)}>{displayFieldCodeText('help')}</p>
						) : 
						<p className={cx(classes.content)}>Non renseigné</p>
						}
					</div>
					<div>
						<p className={cx(classes.subtitle)}>
							Autre type(s) d'aide sollicitée(s)
						</p>
                        {displayFieldCodeText('help') === 'Oui'? (
							<p className={cx(classes.content)}>
								{review.answers &&
									review.answers
										.filter(answer => answer.field_code === 'help_details')
										?.map(
											(el, index, array) => {
                                                return el.answer_text !== 'Autre' ? el.answer_text + (index < array.length - 1 ? ', ' : '.') : ''
                                             }
										)}
                                
                                {review.answers && review.answers.filter(answer => answer.field_code === 'help_details_verbatim').length > 0 &&
                                    <p className={cx(classes.content)}>
                                        Autre : "{review.answers.filter(answer => answer.field_code === 'help_details_verbatim')[0].answer_text || ''}"
                                    </p>
                                }
							</p>
						) : (
							<p className={cx(classes.content)}>Non renseigné</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

const useStyles = tss.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		height: '100%'
	},
    greyContainer: {
        backgroundColor: fr.colors.decisions.background.alt.blueFrance.default
    },
	subtitle: {
		fontSize: 12,
		fontWeight: 'bold',
		marginBottom: 0
	},
	content: {
		fontSize: 12,
		fontWeight: 400,
		marginBottom: 0
	},
	badge: {
		fontSize: 12,
		width: 100,
		paddingVertical: 4
	}
});

export default ReviewCommonVerbatimLine;
