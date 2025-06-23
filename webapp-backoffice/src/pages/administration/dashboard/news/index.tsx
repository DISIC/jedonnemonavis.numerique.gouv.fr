import NewsLayout from '@/src/layouts/News/NewsLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import React from 'react';
import { tss } from 'tss-react/dsfr';

const NewsPage = () => {
	const { cx, classes } = useStyles();
	return (
		<NewsLayout>
			<div className={fr.cx('fr-grid-row')}>
				<div className={fr.cx('fr-col-12')}>
					<h2 className={fr.cx('fr-mb-0')}>Dernières fonctionnalités</h2>
				</div>
				<div
					className={cx(
						classes.summaryContainer,
						fr.cx('fr-col-12', 'fr-p-8v', 'fr-my-12v', 'fr-text--xs')
					)}
				>
					<span className={cx(classes.summaryTitle)}>Sommaire</span>
					<ul className={cx(classes.summaryList, fr.cx('fr-mt-2v'))}>
						<li>
							<b>1.</b> Édition du formulaire
						</li>
						<li>
							<b>2.</b> Nouvelle interface
						</li>
						<li>
							<b>3.</b> Évolution des boutons
						</li>
					</ul>
				</div>
				<div className={fr.cx('fr-col-12')}>
					<h3 className={cx(classes.newsTitle, fr.cx('fr-mb-6v'))}>
						Édition du formulaire
					</h3>
					<p className={fr.cx('fr-mb-0')}>
						Vous pouvez désormais adapter vos formulaires à vos besoins
						spécifiques :
					</p>
					<ul className={classes.customList}>
						<li>Masquer une question</li>
						<li>Masquer une proposition de réponse</li>
						<li>Ajouter des questions supplémentaires</li>
						<li>Modifier le texte d'introduction</li>
					</ul>
					<p className={fr.cx('fr-mb-0')}>
						Ces fonctionnalités sont accessibles depuis la section Formulaire de
						votre service.
					</p>
					<div className={cx(classes.imageContainer, fr.cx('fr-mt-6v'))}>
						<Image
							src="/assets/news-feature-1.png"
							alt=""
							width={450}
							height={285}
							className={classes.image}
						/>
					</div>
					<p
						className={fr.cx('fr-mb-0', 'fr-text--xs', 'fr-mt-1v')}
						style={{ color: fr.colors.decisions.text.mention.grey.default }}
					>
						Exemple d’édition d’une question
					</p>
					<hr className={fr.cx('fr-hr', 'fr-mt-12v')} />
				</div>
				<div className={fr.cx('fr-col-12')}>
					<h3 className={cx(classes.newsTitle, fr.cx('fr-mb-6v'))}>
						Nouvelle interface
					</h3>
					<p className={fr.cx('fr-mb-0')}>
						⭐️ Visualisez la liste de vos formulaires directement sur la page
						du service
					</p>
					<div className={cx(classes.imageContainer, fr.cx('fr-mt-6v'))}>
						<Image
							src="/assets/news-feature-2.png"
							alt=""
							width={450}
							height={247}
							className={classes.image}
						/>
					</div>
					<p
						className={fr.cx('fr-mb-0', 'fr-text--xs', 'fr-mt-1v')}
						style={{ color: fr.colors.decisions.text.mention.grey.default }}
					>
						Service avec 2 formulaires actifs
					</p>
					<p className={fr.cx('fr-mb-0', 'fr-mt-6v')}>
						⭐️ Découvrez les résultats de chaque formulaire via les onglets de
						navigation️
					</p>
					<div className={cx(classes.imageContainer, fr.cx('fr-mt-6v'))}>
						<Image
							src="/assets/news-feature-3.png"
							alt=""
							width={450}
							height={306}
							className={classes.image}
						/>
					</div>
					<p
						className={fr.cx('fr-mb-0', 'fr-text--xs', 'fr-mt-1v')}
						style={{ color: fr.colors.decisions.text.mention.grey.default }}
					>
						Onglet Statistiques
					</p>
					<hr className={fr.cx('fr-hr', 'fr-mt-12v')} />
				</div>
				<div className={fr.cx('fr-col-12')}>
					<h3 className={cx(classes.newsTitle, fr.cx('fr-mb-6v'))}>
						Évolution de la gestion des boutons
					</h3>
					<p className={fr.cx('fr-mb-6v')}>
						⭐️ Générez maintenant vos liens Je Donne Mon Avis en cliquant sur
						“Créer un emplacement” depuis l’onglet Paramètres
					</p>
					<p className={fr.cx('fr-mb-6v')}>
						⭐️ Créez plusieurs emplacements et comparez les résultats de
						différents parcours ou supports (mobile, site web)
					</p>
					<p className={fr.cx('fr-mb-0')}>
						⭐️ Comparez les résultats par emplacements grâce au filtre sur
						l’onglet Statistiques
					</p>
					<div className={cx(classes.imageContainer, fr.cx('fr-mt-6v'))}>
						<Image
							src="/assets/news-feature-4.png"
							alt=""
							width={450}
							height={357}
							className={classes.image}
						/>
					</div>
					<p
						className={fr.cx('fr-mb-0', 'fr-text--xs', 'fr-mt-1v')}
						style={{ color: fr.colors.decisions.text.mention.grey.default }}
					>
						Onglet Formulaire avec un emplacement créé
					</p>
				</div>
			</div>
		</NewsLayout>
	);
};

const useStyles = tss.create({
	summaryContainer: {
		backgroundColor: fr.colors.decisions.background.contrast.grey.default
	},
	summaryTitle: {
		fontWeight: 'bold',
		textTransform: 'uppercase'
	},
	summaryList: {
		padding: 0,
		margin: 0,
		listStyle: 'none',
		li: {
			...fr.spacing('padding', { topBottom: '2v' })
		}
	},
	newsTitle: {
		color: fr.colors.decisions.text.title.blueFrance.default,
		fontSize: '1.5rem',
		lineHeight: '2rem'
	},
	customList: {
		listStyle: 'none',
		paddingLeft: 0,
		margin: 0,
		...fr.spacing('margin', { topBottom: '4v' }),
		'& li': {
			position: 'relative',
			paddingLeft: fr.spacing('6v'),
			marginBottom: fr.spacing('1v'),
			'&::before': {
				content: '"✅"',
				position: 'absolute',
				left: 0,
				top: 0,
				fontSize: '16px',
				lineHeight: '24px'
			}
		}
	},
	imageContainer: {
		display: 'flex',
		justifyContent: 'center',
		width: '100%',
		backgroundColor: fr.colors.options.blueEcume._950_100.default
	},
	image: {
		maxWidth: '100%',
		[fr.breakpoints.down('md')]: {
			height: 'auto'
		}
	}
});

export default NewsPage;
