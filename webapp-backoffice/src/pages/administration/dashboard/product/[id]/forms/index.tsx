import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';

import FormCreationModal from '@/src/components/dashboard/Form/FormCreationModal';
import NoFormsPanel from '@/src/components/dashboard/Pannels/NoFormsPanel';
import ServiceFormsNoButtonsPanel from '@/src/components/dashboard/Pannels/ServiceFormsNoButtonsPanel';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import {
	formatDateToFrenchString,
	formatNumberWithSpaces
} from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {
	product: ProductWithForms;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const new_form_modal = createModal({
	id: 'new-form-modal',
	isOpenedByDefault: false
});

const ProductButtonsPage = (props: Props) => {
	const { product, ownRight } = props;
	const { cx, classes } = useStyles();
	const router = useRouter();

	const { data: reviewsCountData } = trpc.review.getCountsByForm.useQuery({
		product_id: product.id
	});

	const getFormReviewCount = (formId: number, legacy: boolean) =>
		legacy
			? (reviewsCountData?.countsByForm[formId.toString()] ?? 0) +
				(reviewsCountData?.countsByForm['1'] ?? 0) +
				(reviewsCountData?.countsByForm['2'] ?? 0)
			: reviewsCountData?.countsByForm[formId.toString()] ?? 0;
	const getFormNewReviewCount = (formId: number, legacy: boolean) => reviewsCountData?.newCountsByForm[formId.toString()] ?? 0;

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
					<FormCreationModal modal={new_form_modal} productId={product.id} />
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
						<div className={fr.cx('fr-col-12', 'fr-col-md-6')}>
							<h2 className={fr.cx('fr-mb-0')}>Formulaires</h2>
						</div>
						<div
							className={cx(
								classes.headerButtons,
								fr.cx('fr-col-12', 'fr-col-md-6', 'fr-mb-6v')
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
						{/* <div className={cx(fr.cx('fr-col-12'))}>
							<Checkbox
								options={[
									{
										label: 'Afficher les formulaires supprimés',
										nativeInputProps: {
											name: 'checkboxes-1',
											value: 'value1'
										}
									}
								]}
							/>
						</div> */}
						<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-12'))}>
							{product.forms.map(form => (
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
											fr.cx(
												'fr-col',
												'fr-col-12',
												'fr-col-md-7',
												'fr-pb-0',
												form.buttons.length === 0 && 'fr-mb-6v'
											)
										)}
									>
										<Link
											href={`/administration/dashboard/product/${product.id}/forms/${form.id}`}
											className={cx(classes.productTitle)}
										>
											<span>{form.title || form.form_template.title}</span>
										</Link>
										{form.buttons.length > 0 && (
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
										)}
									</div>
									{form.buttons.length > 0 ? (
										<div
											className={cx(
												fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5'),
												classes.formStatsContent
											)}
										>
											{getFormNewReviewCount(form.id, form.legacy) > 0 && (
												<Badge
													severity="success"
													noIcon
													small
													className={fr.cx('fr-mr-4v')}
												>
													{getFormNewReviewCount(form.id, form.legacy)}{' '}
													NOUVELLES RÉPONSES
												</Badge>
											)}
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
										</div>
									) : (
										<ServiceFormsNoButtonsPanel form={form} />
									)}
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</ProductLayout>
	);
};

export default ProductButtonsPage;

const useStyles = tss
	.withName(ProductButtonsPage.name)
	.withParams()
	.create({
		formCard: {
			backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
			display: 'flex',
			flexWrap: 'wrap',
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
			height: '100%',
			justifyContent: 'end',
			gap: fr.spacing('1v'),
			[fr.breakpoints.down('md')]: {
				marginTop: fr.spacing('4v'),
				justifyContent: 'start',
				flexWrap: 'wrap'
			}
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
		}
	});

export { getServerSideProps };
