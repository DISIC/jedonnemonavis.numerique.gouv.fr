import { Loader } from '@/src/components/ui/Loader';
import { CustomModalProps } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { tss } from 'tss-react/dsfr';
import NoButtonsPanel from '../../Pannels/NoButtonsPanel';
import { ButtonModalType } from '../../ProductButton/ButtonModal';
import ProductButtonCard from '../../ProductButton/ProductButtonCard';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Accordion from '@codegouvfr/react-dsfr/Accordion';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	modal: CustomModalProps;
	handleModalOpening: (modalType: ButtonModalType, button?: any) => void;
	alertText: string;
	isAlertShown: boolean;
	setIsAlertShown: (value: boolean) => void;
}

const faqContents: { title: string; children: JSX.Element }[] = [
	{
		title: 'Pourquoi créer plusieurs liens d’intégration ?',
		children: (
			<>
				<p>
					Si vous souhaitez afficher plusieurs boutons Je donne mon avis, il est
					recommandé de créer un lien d’intégration distinct pour chacun d’eux.
				</p>
				<p>
					Cette approche vous permet d’obtenir des{' '}
					<strong>données plus précises</strong>, de{' '}
					<strong>comparer les statistiques</strong> grâce aux filtres
					disponibles et de <strong>trier les réponses</strong> selon leur
					origine — par exemple, selon le parcours emprunté par l’usager ou
					selon qu’il réponde depuis un e-mail ou depuis la démarche en ligne.
					<br />
					Vous pouvez également vous en servir pour d’autres cas d’usages, comme
					pour réaliser un AB testing (tester deux versions d'une page ou d'un
					parcours en parallèle).
				</p>
				<p>
					Note : Il n'est pas possible d'insérer plusieurs liens d'intégration
					sur Démarche Simplifiée pour l'instant.
					<br />
					<a
						href="https://docs.numerique.gouv.fr/docs/b824bc7b-fed3-4b75-91ca-1e6f9a5a6df1"
						target="_blank"
					>
						En savoir plus
					</a>
				</p>
			</>
		)
	},
	{
		title:
			'Comment définir le meilleur emplacement pour son bouton Je donne mon avis ?',
		children: (
			<>
				<p>
					Idéalement, il faut placer le bouton JDMA sur une page de
					confirmation, qui <strong>ne contient pas d’action principale</strong>{' '}
					(bouton primaire) lui faisant quitter la page. <br />
					Il est aussi important d’
					<strong>
						expliquer à quoi sert le bouton JDMA et de le mettre en valeur
					</strong>
					. Pour ce faire, il faut le distinguer visuellement (en jouant sur
					l’espacement et/ou sur les couleurs) et le contextualiser avec une
					phrase d’accroche.
				</p>
				<p>
					Vous pouvez placer le bouton sur votre démarche, dans un email de
					confirmation ou dans un email dédié.
					<br />
					<a
						href="https://docs.numerique.gouv.fr/docs/68bd689e-4323-4fd4-aac6-135c750668ff"
						target="_blank"
					>
						En savoir plus
					</a>
				</p>
			</>
		)
	},
	{
		title: 'Comment intégrer un lien sur mon site ?',
		children: (
			<>
				<p>
					L’intégration d’un lien permet d’afficher le bouton{' '}
					<strong>Je donne mon avis</strong> sur votre site.
				</p>
				<p>
					<b>Étape 1</b>
					<br />
					Créer un lien d’intégration depuis l'onglet{' '}
					<strong>Liens d'intégration</strong> du formulaire JDMA. Ce lien
					correspond à un code à insérer sur le site de votre choix.
				</p>
				<p>
					<b>Étape 2</b>
					<br />
					Coller le code à l’endroit souhaité sur le site, à l’emplacement où
					vous souhaitez faire apparaître le bouton{' '}
					<strong>Je donne mon avis</strong>. Vous pouvez aussi coller le code
					sur le site de Démarche Simplifiée.
					<br />
					<a
						href="https://docs.numerique.gouv.fr/docs/c6d84027-74e7-4df4-8f7e-fb33f0c60c91"
						target="_blank"
					>
						En savoir plus
					</a>
				</p>
			</>
		)
	},
	{
		title: 'Modifier un formulaire qui est déjà en ligne',
		children: (
			<>
				<p>
					Vous pouvez à tout moment ajuster un formulaire sans avoir à le
					recréer ou à modifier les liens d’intégration existants. Les
					modifications apportées sont automatiquement prises en compte et
					visibles par les usagers.
				</p>
				<p>
					<b>Données</b>
					<br />
					Il n’y a aucun impact sur les données déjà collectées. Pour les
					nouvelles données, toute modification de l’affichage d’une étape ou
					d’une option de réponse se répercute sur les statistiques. <br />
					<a
						href="https://docs.numerique.gouv.fr/docs/bd97cb99-ac14-434f-bb13-aed58acabd24"
						target="_blank"
					>
						En savoir plus
					</a>
				</p>
			</>
		)
	}
];

const LinksTab = ({
	form,
	ownRight,
	modal,
	handleModalOpening,
	alertText,
	isAlertShown,
	setIsAlertShown
}: Props) => {
	const router = useRouter();
	const { cx, classes } = useStyles();

	const isModalOpen = useIsModalOpen(modal);

	useEffect(() => {
		if (router.query.shouldOpenButtonModal) {
			handleModalOpening('create');
		}
	}, [router.query]);

	useEffect(() => {
		if (!isModalOpen && router.query.shouldOpenButtonModal) {
			const { shouldOpenButtonModal, ...restQuery } = router.query;
			router.replace(
				{
					pathname: router.pathname,
					query: restQuery
				},
				undefined,
				{ shallow: true }
			);
		}
	}, [isModalOpen]);

	const {
		data: buttonResults,
		isLoading: isLoadingButtons,
		isRefetching: isRefetchingButtons
	} = trpc.button.getList.useQuery(
		{
			page: 1,
			numberPerPage: 1000,
			form_id: form.id,
			isTest: false
		},
		{
			initialData: {
				data: [],
				metadata: {
					count: 0
				}
			}
		}
	);

	if (isLoadingButtons || isRefetchingButtons) {
		return (
			<div className={cx(classes.loaderContainer)}>
				<Loader />
			</div>
		);
	}

	const {
		data: buttons,
		metadata: { count: buttonsCount }
	} = buttonResults;

	return (
		<div className={fr.cx('fr-grid-row')}>
			<Alert
				className={fr.cx('fr-col-12', 'fr-mb-6v')}
				description={alertText}
				severity="success"
				small
				closable
				isClosed={!isAlertShown}
				onClose={() => setIsAlertShown(false)}
			/>
			<h3 className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-0')}>
				Lien d'intégration
			</h3>
			<div
				className={cx(classes.buttonsGroup, fr.cx('fr-col-12', 'fr-col-md-4'))}
			>
				{ownRight === 'carrier_admin' && !form.isDeleted && (
					<Button
						priority="secondary"
						iconId="fr-icon-add-line"
						iconPosition="right"
						onClick={() => {
							handleModalOpening('create');
						}}
					>
						Créer un lien d'intégration
					</Button>
				)}
			</div>

			<div className={fr.cx('fr-col-12', 'fr-mt-8v')}>
				{!(isLoadingButtons || isRefetchingButtons) &&
					buttonsCount === 0 &&
					(!form.isDeleted ? (
						<NoButtonsPanel
							onButtonClick={() => handleModalOpening('create')}
						/>
					) : (
						<div
							className={fr.cx('fr-col-12')}
							style={{ display: 'flex', justifyContent: 'center' }}
						>
							<span>Aucun lien d'intégration trouvé</span>
						</div>
					))}
				{!(isLoadingButtons || isRefetchingButtons) &&
					buttons &&
					[
						...buttons
							.filter(b => !b.isDeleted)
							.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
						...buttons
							.filter(b => b.isDeleted)
							.sort(
								(a, b) =>
									(b.deleted_at?.getTime() ?? 0) -
									(a.deleted_at?.getTime() ?? 0)
							)
					].map((button, index) => (
						<ProductButtonCard
							key={index}
							button={button}
							onButtonClick={handleModalOpening}
							ownRight={ownRight}
						/>
					))}
			</div>

			<div className={fr.cx('fr-col-12', 'fr-mt-16v')}>
				{faqContents.map((faq, index) => (
					<Accordion key={index} label={faq.title}>
						<div className={cx(classes.accordionContent)}>{faq.children}</div>
					</Accordion>
				))}
			</div>
		</div>
	);
};

const useStyles = tss.withName(LinksTab.name).create({
	container: {
		...fr.spacing('padding', {}),
		background: fr.colors.decisions.artwork.decorative.blueFrance.default,
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'start',
		height: '500px',
		width: '100%'
	},
	buttonsGroup: {
		display: 'flex',
		justifyContent: 'end',
		gap: fr.spacing('4v'),
		alignSelf: 'center',
		button: {
			a: {
				display: 'flex',
				alignItems: 'center'
			}
		},
		[fr.breakpoints.down('md')]: {
			marginTop: fr.spacing('4v'),
			button: {
				width: '100%',
				justifyContent: 'center'
			}
		}
	},
	accordionContent: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('2v'),
		padding: fr.spacing('6v'),
		backgroundColor: fr.colors.decisions.background.contrast.grey.default,
		p: {
			':last-child': {
				marginBottom: 0
			}
		},
		a: {
			display: 'inline-block',
			marginTop: fr.spacing('2v'),
			color: fr.colors.decisions.text.title.blueFrance.default,
			fontSize: '14px'
		}
	}
});

export default LinksTab;
