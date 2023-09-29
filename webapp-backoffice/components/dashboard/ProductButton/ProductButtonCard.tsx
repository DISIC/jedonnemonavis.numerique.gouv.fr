import { formatDateToFrenchString } from '@/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Button as PrismaButtonType } from '@prisma/client';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import React from 'react';
import ButtonModal from './ButtonModal';

interface Props {
	button: PrismaButtonType;
}

const modal = createModal({
	id: 'button-modal',
	isOpenedByDefault: false
});

const ProductButtonCard = (props: Props) => {
	const { button } = props;
	const [modalType, setModalType] = React.useState<string>('');

	const isModalOpen = useIsModalOpen(modal);

	const handleModalOpening = (modalType: string) => {
		setModalType(modalType);
		modal.open();
	};

	return (
		<>
			<ButtonModal modal={modal} isOpen={isModalOpen} modalType={modalType} />
			<div className={fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w')}>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<p className={fr.cx('fr-mb-0')}>{button.title}</p>
						<p className={fr.cx('fr-mb-0')}>{button.description}</p>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
						<p>{formatDateToFrenchString(button.created_at.toString())}</p>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
						<Button priority="secondary">Options</Button>
						<Button
							className={fr.cx('fr-ml-4w')}
							onClick={() => handleModalOpening('install')}
						>
							Installer
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProductButtonCard;
