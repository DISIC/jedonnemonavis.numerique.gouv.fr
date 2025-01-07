import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { fr } from '@codegouvfr/react-dsfr';

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
	modal: CustomModalProps;
	productTitle: string;
	onClose: () => void;
}

const EssentialProductModal = (props: Props) => {
	const { modal, productTitle, onClose } = props;
	return (
		<modal.Component
			size="large"
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			title="Démarche essentielle"
			concealingBackdrop={false}
			buttons={[
				{
					children: 'Fermer',
					onClick: onClose
				}
			]}
		>
			<p>
				Le service <strong>{productTitle}</strong> fait partie des démarches
				essentielles et ne peut pas être supprimé.
			</p>
		</modal.Component>
	);
};

export default EssentialProductModal;
