import { AdminEntityRightModalType } from '@/src/pages/administration/dashboard/entities';
import { AdminEntityRightWithUsers } from '@/src/types/prismaTypesExtended';
import { getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { AdminEntityRight, Entity } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../../ui/Loader';
import EntityRightCard from './EntityRightCard';
import { useSession } from 'next-auth/react';
import Alert from '@codegouvfr/react-dsfr/Alert';

interface CustomModalProps {
	buttonProps: {
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}

interface Props {
	isOpen: boolean;
	modal: CustomModalProps;
	refetchEntities: () => void;
	entity?: Entity;
}

const EntityRightsModal = (props: Props) => {
	const { cx, classes } = useStyles();
	const { modal, entity, isOpen, refetchEntities } = props;

	const { data: session } = useSession();

	const [currentPage, setCurrentPage] = React.useState(1);
	const [numberPerPage, _] = React.useState(1000);
	const [adminEntityRights, setAdminEntityRights] = useState<
		AdminEntityRightWithUsers[]
	>([]);
	const [adminEntityRightsCount, setAdminEntityRightsCount] =
		useState<number>(0);

	const nbPages = getNbPages(adminEntityRightsCount, numberPerPage);

	trpc.adminEntityRight.getList.useQuery(
		{
			page: currentPage,
			numberPerPage,
			entity_id: entity?.id || -1
		},
		{
			enabled: !!entity,
			onSuccess: adminEntityRightsResult => {
				setAdminEntityRights(adminEntityRightsResult.data);
				setAdminEntityRightsCount(adminEntityRightsResult.metadata.count);
			}
		}
	);

	const handleModalClose = () => {
		modal.close();
	};

	const handleModalButtons = (
		modalType: AdminEntityRightModalType,
		adminEntityRight?: AdminEntityRightWithUsers
	) => {
		if (modalType === 'remove') {
		}
		console.log(modalType);
		console.log(adminEntityRight);
	};

	const displayModalButtons = ():
		| ModalProps.ActionAreaButtonProps
		| [ModalProps.ActionAreaButtonProps, ...ModalProps.ActionAreaButtonProps[]]
		| undefined => {
		return [
			{
				children: 'Retour',
				iconId: 'ri-arrow-left-line',
				priority: 'secondary',
				doClosesModal: false,
				onClick: () => handleModalClose()
			}
		];
	};

	const displayRightsTable = () => {
		if (!adminEntityRights.length) {
			return (
				<Alert
					className={fr.cx('fr-mb-16v')}
					description={
						<>
							Cette organisation n’a pas d’administrateur. Si vous voulez
							devenir administrateur, merci d’envoyer un email à la brigade :
							[adresse email de contact].
						</>
					}
					severity="info"
					title=""
				/>
			);
		}

		return (
			<>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col-8')}>
						{nbPages > 1 && (
							<span className={fr.cx('fr-ml-0')}>
								Administrateurs de{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (currentPage - 1) + 1}
								</span>{' '}
								à{' '}
								<span className={cx(classes.boldText)}>
									{numberPerPage * (currentPage - 1) + adminEntityRights.length}
								</span>{' '}
								sur{' '}
								<span className={cx(classes.boldText)}>
									{adminEntityRightsCount}
								</span>
							</span>
						)}
					</div>
				</div>
				<div>
					{!entity ? (
						<div className={fr.cx('fr-py-10v')}>
							<Loader />
						</div>
					) : (
						adminEntityRights.map((adminEntityRight, index) => (
							<EntityRightCard
								key={index}
								adminEntityRight={adminEntityRight}
								onButtonClick={handleModalButtons}
								isMine={isMine}
							/>
						))
					)}
				</div>
			</>
		);
	};

	const isMine = adminEntityRights
		.map(aer => aer.user_email)
		.includes(session?.user?.email || 'none');

	const displayModalContent = () => {
		if (entity) {
			return (
				<div className={fr.cx('fr-mt-8v')}>
					{!isMine && (
						<p>
							Pour devenir administrateur, contacter l’une de ces personnes.
						</p>
					)}
					<h6 className={fr.cx('fr-mt-2v')}>{entity?.name}</h6>
					{displayRightsTable()}
				</div>
			);
		}
	};

	useEffect(() => {
		if (!!entity) {
			console.log(entity);
		}
	}, [entity]);

	return (
		<modal.Component
			title="Devenir administrateur"
			concealingBackdrop={false}
			size="large"
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			buttons={displayModalButtons()}
		>
			{displayModalContent()}
		</modal.Component>
	);
};

const useStyles = tss.withName(EntityRightsModal.name).create(() => ({
	textArea: {
		'.fr-input': {
			height: '200px',
			minHeight: '200px'
		}
	},
	topContainer: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	accordion: {
		'.fr-accordion__btn': {
			backgroundColor: '#FFF',
			color: fr.colors.decisions.text.active.grey.default
		},
		'.fr-accordion__btn[aria-expanded=true]': {
			backgroundColor: '#FFF',
			color: fr.colors.decisions.text.active.grey.default,
			'&:hover': {
				backgroundColor: '#FFF'
			},
			'&:active': {
				backgroundColor: '#FFF'
			}
		}
	},
	boldText: {
		fontWeight: 'bold'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default EntityRightsModal;
