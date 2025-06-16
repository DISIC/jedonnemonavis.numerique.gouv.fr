import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import React from 'react';
import ApiKeyHandler from './ApiKeyHandler';
import { Entity } from '@prisma/client';
import Link from 'next/link';
import { CustomModalProps } from '@/src/types/custom';

interface Props {
	modal: CustomModalProps;
	entity?: Entity;
}

const ApiKeyModal = (props: Props) => {
	const { modal, entity } = props;

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={'Gérer les clés API'}
			size="large"
		>
			<p>
				<Link className={fr.cx('fr-link')} target="_blank" href="/open-api">
					Voir la documentation de l'API
				</Link>
			</p>
			<ApiKeyHandler entity={entity} ownRight={'carrier_admin'}></ApiKeyHandler>
		</modal.Component>
	);
};

export default ApiKeyModal;
