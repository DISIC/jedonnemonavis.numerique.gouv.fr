import { fr } from '@codegouvfr/react-dsfr';
import { ExtendedReview } from './interface';
import { tss } from 'tss-react/dsfr';

const ReviewLineMoreInfos = ({ review }: { review: ExtendedReview }) => {
	const { cx, classes } = useStyles();

	if (!review) return null;

	const displayFieldCodeText = (fieldCode: string) => {
		return review.answers?.find(answer => answer.field_code === fieldCode)
			?.answer_text;
	};

	return (
		<div className={cx(fr.cx('fr-p-3v'), classes.container)}>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--gutters',
					'fr-grid-row--left',
					'fr-mb-1-5v'
				)}
			>
				<div className={fr.cx('fr-col-1')}>
					<p className={cx(classes.subtitle)}>Horaire</p>
					<p className={cx(classes.content)}>
						{review.created_at &&
							new Date(review.created_at).getHours() +
								':' +
								new Date(review.created_at).getMinutes()}
					</p>
				</div>
				<div className={fr.cx('fr-col-2')}>
					<p className={cx(classes.subtitle)}>Identifiant</p>
					<p className={cx(classes.content)}>{review.form_id && review.id}</p>
				</div>
				<div className={fr.cx('fr-col-9')}>
					<p className={cx(classes.subtitle)}>Verbatim</p>
					<p className={cx(classes.content)}>
						{review.verbatim ? review.verbatim.answer_text : 'Non renseigné'}
					</p>
				</div>
			</div>
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
						{displayFieldCodeText('difficulties') === 'Oui' && (
							<p className={cx(classes.content)}>
								{review.answers &&
									review.answers
										.filter(
											answer => answer.field_code === 'difficulties_details'
										)
										?.map(
											(el, index, array) =>
												el.answer_text + (index < array.length - 1 ? ', ' : '.')
										)}
							</p>
						)}
					</div>
				</div>
				<div className={fr.cx('fr-col-4')}>
					<div>
						<p className={cx(classes.subtitle)}>
							Tentative de contacter le service d'aide ?
						</p>
						<p className={cx(classes.content)}>
							{displayFieldCodeText('contact')}
						</p>
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
											(el, index, array) =>
												el.answer_text + (index < array.length - 1 ? ', ' : '.')
										)}
							</p>
						) : (
							<p className={cx(classes.content)}>Non renseigné</p>
						)}
					</div>
				</div>
				<div className={fr.cx('fr-col-4')}>
					<div>
						<p className={cx(classes.subtitle)}>Autre aide sollicitée ?</p>
						<p className={cx(classes.content)}>
							{displayFieldCodeText('help')}
						</p>
					</div>
					<div>
						<p className={cx(classes.subtitle)}>
							Autre type(s) d'aide sollicitée(s)
						</p>
						<p className={cx(classes.content)}>
							{displayFieldCodeText('help_details') === 'Oui'
								? displayFieldCodeText('help_details')
								: 'Non renseigné'}
						</p>
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
		height: '100%',
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
	}
});

export default ReviewLineMoreInfos;
