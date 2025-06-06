import ProductButtonCard from '@/src/components/dashboard/ProductButton/ProductButtonCard';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';
import { Pagination } from '../../../../../../components/ui/Pagination';

import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import ProductFormConfigurationInfo from '@/src/components/dashboard/Product/ProductFormConfigurationInfo';
import ButtonModal from '@/src/components/dashboard/ProductButton/ButtonModal';
import { Loader } from '@/src/components/ui/Loader';
import { useFilters } from '@/src/contexts/FiltersContext';
import {
	ButtonWithForm,
	ProductWithForms
} from '@/src/types/prismaTypesExtended';
import { formatDateToFrenchString, formatNumberWithSpaces, getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { push } from '@socialgouv/matomo-next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import Link from 'next/link';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import FormCreationModal from '@/src/components/dashboard/Form/FormCreationModal';
import NoFormsPanel from '@/src/components/dashboard/Pannels/NoFormsPanel';

interface Props {
	product: ProductWithForms;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const modal = createModal({
	id: 'button-modal',
	isOpenedByDefault: false
});

const new_form_modal = createModal({
	id: 'new-form-modal',
	isOpenedByDefault: false
});

const ProductButtonsPage = (props: Props) => {
	const { product, ownRight } = props;
	const { cx, classes } = useStyles();
	
	const { data: reviewsData, isLoading: isLoadingReviewsCount } =
		trpc.review.getList.useQuery({
			numberPerPage: 0,
			page: 1,
			product_id: product.id
		});

	const nbReviews = reviewsData?.metadata.countAll || 0;
	const nbNewReviews = reviewsData?.metadata.countNew || 0;

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
						<div className={fr.cx('fr-col-6')}>
							<h2 className={fr.cx('fr-mb-0')}>Formulaires</h2>
						</div>
						<div className={cx(classes.headerButtons, fr.cx('fr-col-6'))}>
							{ownRight === 'carrier_admin' && (
								<Button priority='secondary' onClick={new_form_modal.open}>
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
						<div className={cx(fr.cx('fr-col-12'))}>
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
						</div>
						<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-12'))}> 
							{product.forms.map((form) => (
								<div key={form.id} className={cx(fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-6v', 'fr-grid-row--middle'), classes.formCard)}>
									<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-9', 'fr-pb-0'))}> 
										<Link 
											href={`/administration/dashboard/product/${product.id}/forms/${form.id}`}
											className={cx(classes.productTitle)}
										>
											<span>
												{form.title || form.form_template.title}
											</span>
										</Link>	
									</div>
									<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-9'))}> 
										<span className={cx(fr.cx('fr-mr-2v'), classes.smallText)}>
											Réponses déposées
										</span>
										<span className={fr.cx('fr-text--bold', 'fr-mr-4v')}>{formatNumberWithSpaces(nbReviews)}</span>
										<Badge severity="success" noIcon small>
											{nbNewReviews} NOUVELLES RÉPONSES
										</Badge>
										{nbReviews > 0 && (
											<Link
												href={`/administration/dashboard/product/${product.id}/reviews`}
												title={`Voir les avis pour ${product.title}`}
												className={fr.cx('fr-link', 'fr-ml-4v')}
											>
												Voir les réponses
											</Link>
										)}
									</div>
									<div className={cx(fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3', 'fr-p-4v', 'fr-mt-auto'), classes.rightButtonsWrapper)}>
										<span className={cx(fr.cx('fr-mr-2v'), classes.smallText)}>
											Modifié le 
										</span>
										<span className={fr.cx('fr-text--bold')}>
											{formatDateToFrenchString(form.updated_at.toString())}
										</span>
									</div>
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
			backgroundColor: fr.colors.decisions.background.contrast.info.default,
			display: 'flex',
			flexWrap: 'wrap',
			width: '100%',
			maxWidth: '100%',
			marginLeft: 0,
			marginRight: 0,
			marginBottom: "0.5rem",
			div: {
				padding: fr.spacing('4v'),
			}
		},
		smallText: {
			color: fr.colors.decisions.text.default.grey.default,
			fontSize: "0.8rem"
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
			}
		},
		rightButtonsWrapper: {
			display: 'flex',
			justifyContent: 'end'
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
	});

export { getServerSideProps };
