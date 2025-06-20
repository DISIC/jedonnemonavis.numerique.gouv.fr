import { Loader } from '@/src/components/ui/Loader';
import { getServerSideProps } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import { CustomModalProps } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { RightAccessStatus } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { tss } from 'tss-react/dsfr';
import NoButtonsPanel from '../../Pannels/NoButtonsPanel';
import ProductButtonCard from '../../ProductButton/ProductButtonCard';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	modal: CustomModalProps;
	handleModalOpening: (modalType: string, button?: any) => void;
	alertText: string;
	isAlertShown: boolean;
	setIsAlertShown: (value: boolean) => void;
}

const contents: { iconId: FrIconClassName | RiIconClassName; text: string }[] =
	[
		{
			iconId: 'ri-eye-off-line',
			text: 'Masquer une possibilité de réponse à une question'
		},
		{
			iconId: 'ri-list-check-3',
			text: 'Masquer une question entière'
		}
	];

const SettingsTab = ({
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
		isRefetching: isRefetchingButtons,
		refetch: refetchButtons
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

	const {
		data: buttons,
		metadata: { count: buttonsCount }
	} = buttonResults;

	const displaySettingsContent = () => {
		if (isLoadingButtons || isRefetchingButtons) {
			return (
				<div className={cx(classes.loaderContainer)}>
					<Loader />
				</div>
			);
		}

		return (
			<>
				<div className={fr.cx('fr-col-8')}>
					<h3 className={fr.cx('fr-mb-0')}>Gérer les emplacements</h3>
				</div>
				{buttonsCount > 0 && (
					<>
						<div
							className={cx(
								classes.buttonsGroup,
								classes.justifyEnd,
								fr.cx('fr-col-4')
							)}
						>
							{ownRight === 'carrier_admin' && (
								<Button
									priority="secondary"
									iconId="fr-icon-add-line"
									iconPosition="right"
									onClick={() => {
										handleModalOpening('create');
									}}
								>
									Créer un emplacement
								</Button>
							)}
						</div>
						<p className={fr.cx('fr-col-12', 'fr-mt-6v')}>
							Lors de la création d’un emplacement, un code HTML est généré. Il
							vous suffit de le copier-coller dans le code de la page où vous
							voulez faire apparaître le bouton d’avis. Vous pouvez créer
							plusieurs emplacements pour chaque formulaire.&nbsp;
							<Link
								href="https://designgouv.notion.site/Pourquoi-cr-er-plusieurs-emplacements-21515cb98241806fa1a4f9251f3ebce7"
								style={{
									color: fr.colors.decisions.text.title.blueFrance.default
								}}
								target="_blank"
							>
								Pourquoi créer plusieurs emplacements ?
							</Link>
						</p>
					</>
				)}
				<div className={fr.cx('fr-col-12', buttonsCount === 0 && 'fr-mt-6v')}>
					{!(isLoadingButtons || isRefetchingButtons) && buttonsCount === 0 && (
						<NoButtonsPanel
							onButtonClick={() => handleModalOpening('create')}
						/>
					)}
					{!(isLoadingButtons || isRefetchingButtons) &&
						buttons?.map((button, index) => (
							<ProductButtonCard
								key={index}
								button={button}
								onButtonClick={handleModalOpening}
								ownRight={ownRight}
							/>
						))}
				</div>
				{!form.product.isTop250 && (
					<>
						<hr className={fr.cx('fr-col-12', 'fr-mt-10v', 'fr-mb-7v')} />
						<div className={fr.cx('fr-col-8')}>
							<h3 className={fr.cx('fr-mb-6v')}>Gérer le formulaire</h3>
						</div>
						<div
							className={cx(classes.container, fr.cx('fr-col-12', 'fr-p-6v'))}
						>
							<div className={fr.cx('fr-grid-row', 'fr-grid-row--middle')}>
								<div className={fr.cx('fr-col-12')}>
									<span className={classes.containerTitle}>
										Éditer le formulaire
									</span>
									<Badge severity="new" className={fr.cx('fr-ml-4v')} small>
										Beta
									</Badge>
								</div>
								<p className={fr.cx('fr-col-12', 'fr-mb-3v', 'fr-mt-6v')}>
									Désormais, pour adapter vos formulaires à vos besoins
									spécifiques, vous pouvez :
								</p>

								{contents.map((content, index) => (
									<div
										key={index}
										className={cx(
											classes.content,
											fr.cx('fr-col-12', 'fr-py-0')
										)}
									>
										<div
											className={cx(
												classes.indicatorIcon,
												cx(fr.cx('fr-mr-md-6v'))
											)}
										>
											<i className={cx(fr.cx(content.iconId), classes.icon)} />
										</div>
										<p>{content.text}</p>
									</div>
								))}

								<p className={fr.cx('fr-col-12', 'fr-mb-0')}>
									Pour en savoir plus sur ces fonctionnalités et découvrir
									celles à venir, vous pouvez&nbsp;
									<a href="/public/roadmap" target="_blank">
										consulter notre feuille de route
									</a>
									.
								</p>
								<div
									className={cx(
										classes.buttonsGroup,
										fr.cx('fr-col-12', 'fr-mt-6v')
									)}
								>
									<Button
										priority="primary"
										iconId="fr-icon-edit-line"
										iconPosition="right"
										size="large"
										onClick={() => {
											router.push(
												`/administration/dashboard/product/${form.product_id}/forms/${form.id}/edit`
											);
										}}
									>
										Éditer le formulaire
									</Button>
								</div>
							</div>
						</div>
					</>
				)}
			</>
		);
	};

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
			<h2 className={fr.cx('fr-col-12', 'fr-mb-10v')}>Paramètres</h2>

			{displaySettingsContent()}
		</div>
	);
};

const useStyles = tss.withName(SettingsTab.name).create({
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
		alignItems: 'center',
		height: '500px',
		width: '100%'
	},
	buttonsGroup: {
		display: 'flex',
		justifyContent: 'center',
		gap: fr.spacing('4v'),
		alignSelf: 'center',
		button: {
			a: {
				display: 'flex',
				alignItems: 'center'
			}
		}
	},
	justifyEnd: {
		justifyContent: 'end'
	},
	content: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: fr.spacing('3v'),
		p: {
			margin: 0
		},
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			marginBottom: fr.spacing('6v')
		}
	},
	indicatorIcon: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '50%',
		backgroundColor: 'white'
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		'::before': {
			'--icon-size': fr.spacing('7v')
		}
	},
	containerTitle: {
		fontWeight: 'bold',
		fontSize: '1.5rem',
		lineHeight: '2rem'
	}
});

export default SettingsTab;

export { getServerSideProps };
