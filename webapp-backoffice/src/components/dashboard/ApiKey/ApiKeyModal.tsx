import { fr } from '@codegouvfr/react-dsfr';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { tss } from 'tss-react/dsfr';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import { Loader } from '../../ui/Loader';
import Link from 'next/link';

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

	const {
		data: resultApiKey,
		isLoading: isLoadingKeys,
		refetch: RefectchKeys
	} = trpc.apiKey.getList.useQuery(
		{},
		{
			initialData: {
				count: 0,
				data: []
			}
		}
	);

	const { data: apiKeys } = resultApiKey;

	const createKey = trpc.apiKey.create.useMutation({});
	const deleteKey = trpc.apiKey.delete.useMutation({});

	const handleCreateKey = async () => {
		await createKey.mutateAsync();
		RefectchKeys();
	};

	const handleDelteKey = async (key: string) => {
		if (confirm('Êtes vous sûr de vouloir supprimer cette clé ?')) {
			await deleteKey.mutateAsync({ key: key });
			RefectchKeys();
		}
	};

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={'Gérer mes clés API'}
			size="large"
		>
			<p>
				<Link className={fr.cx('fr-link')} target="_blank" href="/open-api">
					Voir la documentation de l'API
				</Link>
			</p>

			{!isLoadingKeys && apiKeys.length === 0 && (
				<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
					<p className={fr.cx('fr-mb-0')}>
						Vous n'avez aucune clé API pour le moment.
					</p>
				</div>
			)}

			{isLoadingKeys ? (
				<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
					<Loader />
				</div>
			) : (
				apiKeys.map((key, index) => (
					<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--top',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
								{key.key}
							</div>
							<div
								className={cx(
									fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6'),
									classes.removeWrapper
								)}
							>
								<Button
									priority="tertiary"
									size="small"
									iconId="fr-icon-delete-bin-line"
									iconPosition="right"
									className={cx(classes.iconError)}
									onClick={() => handleDelteKey(key.key)}
								>
									Supprimer
								</Button>
							</div>
						</div>
					</div>
				))
			)}

			<Button
				priority="secondary"
				iconId="fr-icon-add-line"
				className={fr.cx('fr-mt-1w')}
				iconPosition="left"
				type="button"
				onClick={() => handleCreateKey()}
			>
				Ajouter une clé API
			</Button>
		</modal.Component>
	);
};

const useStyles = tss.withName(ApiKeyModal.name).create(() => ({
	removeWrapper: {
		display: 'flex',
		justifyContent: 'end'
	},
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default ApiKeyModal;
