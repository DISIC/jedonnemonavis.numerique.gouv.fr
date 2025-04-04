import { Form } from '@/prisma/generated/zod';
import FormCard from '@/src/components/dashboard/Form/FormCard';
import FormModal from '@/src/components/dashboard/Form/FormModal';
import { Loader } from '@/src/components/ui/Loader';
import { PageItemsCounter, Pagination } from '@/src/components/ui/Pagination';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import React, { useEffect } from 'react';
import { tss } from 'tss-react/dsfr';

export type OnClickActionForm = { type: 'delete'; form: Form };

const formModal = createModal({
	id: 'form-modal',
	isOpenedByDefault: false
});

const DashboardForms = () => {
	const { cx, classes } = useStyles();
	const { data: session } = useSession({ required: true });

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(10);

	const {
		data: formsResult,
		isLoading: isLoadingForms,
		refetch: refetchForms,
		isRefetching: isRefetchingForms
	} = trpc.form.getByUser.useQuery(
		{
			user_id: parseInt(session?.user?.id as string),
			page: currentPage,
			numberPerPage: numberPerPage
		},
		{
			initialData: {
				data: [],
				metadata: {
					formCount: 0
				}
			},
			enabled: session?.user?.id !== undefined
		}
	);

	const deleteForm = trpc.form.delete.useMutation({
		onSuccess: () => {
			refetchForms();
		}
	});

	const {
		data: userForms,
		metadata: { formCount: formCount }
	} = formsResult;

	const nbPages = getNbPages(formCount, numberPerPage);

	const handleActionForm = async ({ type, form }: OnClickActionForm) => {
		switch (type) {
			case 'delete':
				if (
					confirm(
						`Êtes vous sûr de vouloir supprimer le formulaire « ${form.title} » ?`
					)
				) {
					deleteForm.mutate({ id: form.id });
				}
		}
	};

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const onCreateForm = () => {
		setTimeout(() => {
			formModal.open();
		}, 100);
	};

	const handleSubmit = (newForm?: Form) => {
		refetchForms();
	};

	return (
		<>
			<Head>
				<title>Formulaires | Je donne mon avis</title>
				<meta name="description" content={`Formulaires | Je donne mon avis`} />
			</Head>
			<FormModal
				modal={formModal}
				onSubmit={newEntity => handleSubmit(newEntity)}
				user_id={parseInt(session?.user?.id as string)}
			/>
			<div className={fr.cx('fr-container', 'fr-py-6w')}>
				<div
					className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}
				>
					<div className={fr.cx('fr-col-12', 'fr-col-md-5')}>
						<h1 className={fr.cx('fr-mb-0')}>Formulaires</h1>
					</div>
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-md-7'),
							classes.buttonContainer
						)}
					>
						<Button
							priority="secondary"
							iconId="fr-icon-add-circle-line"
							iconPosition="right"
							type="button"
							onClick={onCreateForm}
						>
							Créer un nouveau formulaire
						</Button>
					</div>
				</div>

				<div>
					{isLoadingForms ? (
						<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
							<Loader />
						</div>
					) : (
						<div>
							{nbPages > 1 && (
								<div className={fr.cx('fr-col-8', 'fr-pt-3w')}>
									<PageItemsCounter
										label="Formulaire"
										startItemCount={numberPerPage * (currentPage - 1) + 1}
										endItemCount={
											numberPerPage * (currentPage - 1) + userForms.length
										}
										totalItemsCount={formsResult.metadata.formCount}
									/>
								</div>
							)}
							<div className={cx(classes.formsContainer)}>
								{isRefetchingForms ? (
									<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
										<Loader />
									</div>
								) : userForms.length > 0 ? (
									<>
										<div
											className={fr.cx(
												'fr-grid-row',
												'fr-grid-row--gutters',
												'fr-grid-row--top',
												'fr-grid-row--middle',
												'fr-mt-2w',
												'fr-mb-1w'
											)}
										>
											<div
												className={fr.cx(
													'fr-col',
													'fr-col-12',
													'fr-col-md-3',
													'fr-hidden',
													'fr-unhidden-lg'
												)}
											>
												<b>Nom</b>
											</div>
											<div
												className={fr.cx(
													'fr-col',
													'fr-col-12',
													'fr-col-md-3',
													'fr-hidden',
													'fr-unhidden-lg'
												)}
											>
												<b>Date de Création</b>
											</div>
											<div
												className={fr.cx(
													'fr-col',
													'fr-col-12',
													'fr-col-md-3',
													'fr-hidden',
													'fr-unhidden-lg'
												)}
											>
												<b>Dernière mise à jour</b>
											</div>
										</div>
										{userForms.map((form, index) => (
											<FormCard
												form={form}
												handleActionForm={handleActionForm}
												key={index}
											/>
										))}
									</>
								) : (
									<></>
								)}
								{!isRefetchingForms && userForms.length === 0 && (
									<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
										<div
											className={cx(
												fr.cx('fr-col-12', 'fr-col-md-5', 'fr-mt-30v'),
												classes.textContainer
											)}
											role="status"
										>
											<p>Aucun formulaire trouvé</p>
										</div>
									</div>
								)}
							</div>

							<div
								className={fr.cx(
									'fr-grid-row--center',
									'fr-grid-row',
									'fr-mb-15w'
								)}
							>
								{nbPages > 1 && (
									<Pagination
										showFirstLast
										count={nbPages}
										defaultPage={currentPage}
										getPageLinkProps={pageNumber => ({
											onClick: event => {
												event.preventDefault();
												handlePageChange(pageNumber);
											},
											href: '#',
											classes: { link: fr.cx('fr-pagination__link') },
											key: `pagination-link-entity-${pageNumber}`
										})}
										className={fr.cx('fr-mt-1w')}
									/>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName(DashboardForms.name).create(() => ({
	buttonContainer: {
		[fr.breakpoints.up('md')]: {
			display: 'flex',
			alignSelf: 'flex-end',
			justifyContent: 'flex-end',
			'.fr-btn': {
				justifySelf: 'flex-end'
			}
		},
		[fr.breakpoints.down('md')]: {
			'.fr-btn:first-of-type': {
				marginBottom: '1rem'
			}
		}
	},
	formsContainer: {
		minHeight: '20rem'
	},
	boldText: {
		fontWeight: 'bold'
	},
	textContainer: {
		textAlign: 'center',
		p: {
			margin: 0,
			fontWeight: 'bold'
		}
	}
}));

export default DashboardForms;
