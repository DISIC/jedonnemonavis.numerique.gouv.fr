import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';

import FormCreationModal from '@/src/components/dashboard/Form/FormCreationModal';
import NoFormsPanel from '@/src/components/dashboard/Pannels/NoFormsPanel';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import {
	formatDateToFrenchString,
	formatNumberWithSpaces
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

interface Props {
	product: ProductWithForms;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const new_form_modal = createModal({
	id: 'new-form-modal',
	isOpenedByDefault: false
});

const ProductFormsPage = (props: Props) => {
	const { product, ownRight } = props;
	const { cx, classes } = useStyles();
	const router = useRouter();
	const alertTextQuery = router.query.alert as string;

	const [alertText, setAlertText] = useState(alertTextQuery);
	const [isAlertShown, setIsAlertShown] = useState(!!alertTextQuery);

	useEffect(() => {
		if (router.query.alert) {
			const { alert, ...restQuery } = router.query;
			router.replace(
				{
					pathname: router.pathname,
					query: restQuery
				},
				undefined,
				{ shallow: true }
			);
		}
	}, [router.query]);

	const { data: reviewsCountData } = trpc.review.getCountsByForm.useQuery({
		product_id: product.id
	});

	const getFormReviewCount = (formId: number, legacy: boolean) =>
		legacy
			? (reviewsCountData?.countsByForm[formId.toString()] ?? 0) +
				(reviewsCountData?.countsByForm['1'] ?? 0) +
				(reviewsCountData?.countsByForm['2'] ?? 0)
			: (reviewsCountData?.countsByForm[formId.toString()] ?? 0);

	const getFormNewReviewCount = (formId: number, legacy: boolean) =>
		reviewsCountData?.newCountsByForm[formId.toString()] ?? 0;

	const defaultTitle = useMemo(() => {
		const rootFormTemplate = product.forms.find(
			f => f.form_template.slug === 'root'
		)?.form_template;

		if (!product.forms || product.forms.length === 0)
			return rootFormTemplate?.title || '';

		const existingTemplateForms = product.forms.filter(
			f =>
				rootFormTemplate?.title &&
				f.form_template.title === rootFormTemplate.title
		);

		if (existingTemplateForms.length === 0)
			return rootFormTemplate?.title || '';

		return `${rootFormTemplate?.title} ${existingTemplateForms.length + 1}`;
	}, [product.forms]);

	return (
		<ProductLayout product={product} ownRight={ownRight}>
			<Head>
				<title>{`${product.title} | Formulaires | Je donne mon avis`}</title>
				<meta
					name="description"
					content={`${product.title} | Formulaires | Je donne mon avis`}
				/>
			</Head>
			{product.forms.length === 0 ? (
				<NoFormsPanel product={product} />
			) : (
				<>
					<FormCreationModal
						modal={new_form_modal}
						productId={product.id}
						defaultTitle={defaultTitle}
					/>
					<Alert
						className={fr.cx('fr-col-12', 'fr-mb-6v')}
						description={alertText}
						severity="success"
						small
						closable
						isClosed={!isAlertShown}
						onClose={() => setIsAlertShown(false)}
					/>
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
						<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
							<h2 className={fr.cx('fr-mb-0')}>Formulaires</h2>
						</div>
						<div
							className={cx(
								classes.headerButtons,
								fr.cx('fr-col-12', 'fr-col-md-6', 'fr-mb-6v', 'fr-mb-md-3v')
							)}
						>
							{ownRight === 'carrier_admin' && !product.isTop250 && (
								<Button priority="secondary" onClick={new_form_modal.open}>
									Créer un nouveau formulaire
									<span
										className={fr.cx(
											'fr-icon-file-add-line',
											'fr-icon--sm',
											'fr-ml-2v'
										)}
									/>
								</Button>
							)}
						</div>

						<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-12'))}>
							{product.forms.filter(f => !f.isDeleted).length === 0 && (
								<div className={fr.cx('fr-pb-6v')}>
									<span
										className={cx(classes.smallText)}
										style={{ textAlign: 'center', display: 'block' }}
									>
										Aucun formulaire ouvert pour le moment.
									</span>
								</div>
							)}
							{product.forms
								.filter(f => !f.isDeleted)
								.map(form => (
									<div
										key={form.id}
										className={cx(
											fr.cx(
												'fr-grid-row',
												'fr-mb-6v',
												'fr-p-4v',
												'fr-grid-row--middle'
											),
											classes.formCard
										)}
									>
										<div
											className={cx(
												classes.topFormCardContainer,
												fr.cx('fr-col', 'fr-col-12', 'fr-pb-0')
											)}
										>
											<div
												className={cx(
													classes.productTitleContainer,
													fr.cx('fr-pb-0')
												)}
											>
												<Link
													href={`/administration/dashboard/product/${product.id}/forms/${form.id}`}
													className={cx(classes.productTitle)}
												>
													<span>{form.title || form.form_template.title}</span>
												</Link>
												{form.buttons.length > 0 ? (
													<div
														className={cx(
															fr.cx(
																'fr-col',
																'fr-col-12',
																'fr-col-md-5',
																getFormNewReviewCount(form.id, form.legacy) ===
																	0 && 'fr-hidden'
															),
															classes.formStatsContent
														)}
													>
														{getFormNewReviewCount(form.id, form.legacy) >
															0 && (
															<Badge severity="success" noIcon small>
																{getFormNewReviewCount(form.id, form.legacy)}{' '}
																NOUVELLES RÉPONSES
															</Badge>
														)}
													</div>
												) : (
													<Badge severity="warning" noIcon small>
														Configuration à terminer
													</Badge>
												)}
											</div>
											{form.buttons.length > 0 && (
												<div className={fr.cx('fr-grid-row')}>
													<span
														className={cx(fr.cx('fr-mr-2v'), classes.smallText)}
													>
														Réponses déposées
													</span>
													<span className={fr.cx('fr-text--bold')}>
														{formatNumberWithSpaces(
															getFormReviewCount(form.id, form.legacy)
														)}
													</span>
												</div>
											)}
										</div>
										<div className="fr-mt-4v">
											<span
												className={cx(fr.cx('fr-mr-2v'), classes.smallText)}
											>
												Modifié le
											</span>
											<span className={fr.cx('fr-text--bold')}>
												{formatDateToFrenchString(form.updated_at.toString())}
											</span>
										</div>
									</div>
								))}
							{product.forms.filter(f => f.isDeleted).length > 0 && (
								<div className={fr.cx('fr-mt-8v', 'fr-pb-6v')}>
									<h3 className={fr.cx('fr-mb-3v', 'fr-text--md')}>
										Formulaires fermés
									</h3>
									{product.forms
										.filter(f => !!f.isDeleted)
										.map(form => (
											<div
												key={form.id}
												className={cx(
													fr.cx(
														'fr-grid-row',
														'fr-mb-4v',
														'fr-p-4v',
														'fr-grid-row--middle'
													),
													classes.formCard
												)}
												style={{
													backgroundColor:
														fr.colors.decisions.background.default.grey.hover
												}}
											>
												<div
													className={cx(
														fr.cx(
															'fr-col',
															'fr-col-12',
															'fr-pb-0',
															form.buttons.length === 0 &&
																!form.isDeleted &&
																'fr-mb-6v'
														)
													)}
												>
													<div
														className={cx(
															classes.productTitleContainer,
															fr.cx('fr-pb-0')
														)}
													>
														<Link
															href={`/administration/dashboard/product/${product.id}/forms/${form.id}`}
															className={cx(classes.productTitle)}
														>
															<span>
																{form.title || form.form_template.title}
															</span>
														</Link>
														<div
															className={cx(
																fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5'),
																classes.formStatsContent
															)}
														>
															<Badge severity="error" noIcon small>
																Fermé
															</Badge>
														</div>
													</div>
													{form.deleted_at && (
														<div className="fr-mt-4v">
															<span className={cx(classes.smallText)}>
																{`Fermé le ${formatDateToFrenchString(
																	form.deleted_at.toString()
																)}` +
																	(form.delete_reason
																		? ` : ${form.delete_reason}`
																		: '')}
															</span>
														</div>
													)}
												</div>

												{form.buttons.some(b => b.closedButtonLog) && (
													<Alert
														severity="error"
														title="Tentative de dépôt d'avis"
														description={
															<>
																<small>
																	Un ou plusieurs boutons “Je Donne Mon Avis”
																	sont toujours visibles par les usagers. Nous
																	vous invitons à supprimer le code HTML
																	correspondant de la page concernée.
																</small>
																<ul>
																	{form.buttons
																		.filter(b => b.closedButtonLog)
																		.map(b => (
																			<li key={b.id}>
																				<small>
																					Lien d'intégration &laquo;
																					<b>{b.title}</b>
																					&raquo; — Dernière
																					tentative&nbsp;:&nbsp;
																					{formatDateToFrenchString(
																						b.closedButtonLog?.updated_at.toString() ||
																							''
																					)}
																					&nbsp; — Nombre total de
																					tentatives&nbsp;:&nbsp;
																					{b.closedButtonLog?.count}
																				</small>
																			</li>
																		))}
																</ul>
															</>
														}
														closable
														className={cx(
															fr.cx('fr-mt-2w'),
															classes.alertButtonLog
														)}
														as="h4"
													/>
												)}
											</div>
										))}
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</ProductLayout>
	);
};

export default ProductFormsPage;

const useStyles = tss
	.withName(ProductFormsPage.name)
	.withParams()
	.create({
		formCard: {
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
			display: 'flex',
			width: '100%',
			maxWidth: '100%',
			marginLeft: 0,
			marginRight: 0,
			marginBottom: '0.5rem'
		},
		smallText: {
			color: fr.colors.decisions.text.default.grey.default,
			fontSize: '0.8rem'
		},
		headerButtons: {
			display: 'flex',
			justifyContent: 'end',
			gap: fr.spacing('4v'),
			button: {
				a: {
					display: 'flex',
					alignItems: 'center'
				}
			},
			[fr.breakpoints.down('md')]: {
				button: {
					width: '100%',
					justifyContent: 'center'
				}
			}
		},
		formStatsContent: {
			display: 'flex',
			gap: fr.spacing('1v'),
			[fr.breakpoints.down('md')]: {
				justifyContent: 'start',
				flexWrap: 'wrap'
			}
		},
		topFormCardContainer: {
			display: 'flex',
			width: '100%',
			justifyContent: 'space-between',
			[fr.breakpoints.down('md')]: {
				flexDirection: 'column',
				gap: fr.spacing('4v')
			}
		},
		productTitleContainer: {
			display: 'flex',
			flexWrap: 'wrap',
			flex: 1,
			gap: fr.spacing('4v')
		},
		productTitle: {
			backgroundImage: 'none',
			fontSize: '18px',
			lineHeight: '1.5rem',
			fontWeight: 'bold',
			color: fr.colors.decisions.text.title.blueFrance.default,
			'&:hover': {
				textDecoration: 'underline'
			}
		},
		alertButtonLog: {
			'.fr-link--close': {
				color: fr.colors.decisions.text.actionHigh.redMarianne.default
			}
		}
	});

export { getServerSideProps };
