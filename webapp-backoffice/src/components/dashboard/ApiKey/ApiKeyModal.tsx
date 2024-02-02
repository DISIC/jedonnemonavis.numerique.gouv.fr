import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import { Product } from '@prisma/client';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';

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
}

const ApiKeyModal = (props: Props) => {
	const { modal } = props;
	const { cx, classes } = useStyles();

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={"Gérer mes clés API"}
			size="large"
		>
            <p>Vous n'avez aucune clé API pour le moment.</p>

            <Button
                priority="secondary"
                iconId="fr-icon-add-line"
                className={fr.cx('fr-mt-1w')}
                iconPosition="left"
                type="button"
                onClick={() => console.log('ok')}
            >
                Ajouter une clé API
            </Button>
		</modal.Component>
	);
};

const useStyles = tss.withName(ApiKeyModal.name).create(() => ({
	flexContainer: {
		display: 'flex',
		alignItems: 'center'
	},
	innerButton: {
		alignSelf: 'baseline',
		marginTop: '0.5rem',
		marginLeft: '1rem'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	autocomplete: {
		width: '100%'
	}
}));

export default ApiKeyModal;
