import React from 'react';
import { Entity, Product, RightAccessStatus } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import { Toast } from '@/src/components/ui/Toast';
import { Loader } from '@/src/components/ui/Loader';
import { transformDateToFrenchReadable } from '@/src/utils/tools';
import { push } from '@socialgouv/matomo-next';

interface Props {
	product?: Product;
	entity?: Entity;
	ownRight?: Exclude<RightAccessStatus, 'removed'>;
}

const ApiKeyHandler = (props: Props) => {
	const { product, entity } = props;
	const ownRight = props.ownRight;
	const { cx, classes } = useStyles();

	const [displayToast, setDisplayToast] = React.useState(false);

	const {
		data: resultApiKey,
		isLoading: isLoadingKeys,
		refetch: RefectchKeys
	} = trpc.apiKey.getList.useQuery(
		{
			...(product && { product_id: product.id }),
			...(entity && { entity_id: entity.id })
		},
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
		await createKey.mutateAsync({
			...(product && { product_id: product.id }),
			...(entity && { entity_id: entity.id })
		});
		push(['trackEvent', 'BO - ApiKey', `Create-Key`]);
		RefectchKeys();
	};

	const handleDeleteKey = async (key: string) => {
		push(['trackEvent', 'BO - ApiKey', `Delete-Key`]);
		if (confirm(`Êtes vous sûr de vouloir supprimer la clé « ${key} » ?`)) {
			await deleteKey.mutateAsync({ key: key, product_id: product?.id });
			RefectchKeys();
		}
	};

	return (
		<>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={2000}
				severity="info"
				message="Clé copiée dans le presse papier !"
			/>
			{isLoadingKeys ? (
				<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
					<Loader />
				</div>
			) : (
				<div>
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
						{apiKeys.length > 0 && (
							<>
								<div
									className={fr.cx(
										'fr-col',
										'fr-col-12',
										'fr-col-md-6',
										'fr-hidden',
										'fr-unhidden-lg'
									)}
								>
									<b>Clé</b>
								</div>
								<div
									className={fr.cx(
										'fr-col',
										'fr-col-12',
										'fr-col-md-6',
										'fr-hidden',
										'fr-unhidden-lg'
									)}
								>
									<b>Dernière utilisation</b>
								</div>
							</>
						)}
					</div>
					{apiKeys.map((item, index) => (
						<div
							className={cx(
								fr.cx('fr-card', 'fr-mb-3w', 'fr-p-2w'),
								classes.infoWrapper
							)}
							key={index}
						>
							<div
								className={fr.cx(
									'fr-grid-row',
									'fr-grid-row--gutters',
									'fr-grid-row--top',
									'fr-grid-row--middle'
								)}
							>
								<div
									className={cx(
										fr.cx('fr-col', 'fr-col-12', 'fr-col-lg-6'),
										classes.keyWrapper
									)}
								>
									<b className={fr.cx('fr-hidden-lg')}>Clé : </b>
									{item.key}
								</div>
								<div
									className={cx(
										fr.cx('fr-col', 'fr-col-12', 'fr-col-lg-2'),
										classes.keyWrapper
									)}
								>
									<b className={fr.cx('fr-hidden-lg')}>
										Dernière utilisation :{' '}
									</b>
									<i>
										{item.api_key_logs[0]
											? transformDateToFrenchReadable(
													item.api_key_logs[0].created_at
														.toISOString()
														.split('T')[0]
												)
											: 'Aucune'}
									</i>
								</div>
								<div
									className={cx(
										fr.cx('fr-col', 'fr-col-12', 'fr-col-lg-4'),
										classes.actionsWrapper
									)}
								>
									<Button
										priority="tertiary"
										size="small"
										iconId="ri-file-copy-line"
										iconPosition="right"
										title={`Copier la clé API « ${item.key} » dans le presse-papier`}
										onClick={async () => {
											push(['trackEvent', 'BO - ApiKey', `Copy-Clipboard`]);
											if ('clipboard' in navigator) {
												try {
													await navigator.clipboard.writeText(item.key);
													setDisplayToast(true);
												} catch (err) {
													alert(err);
												}
											} else {
												alert(
													'Fonctionnalité de presse-papiers non prise en charge'
												);
											}
										}}
									>
										{'Copier'}
									</Button>
									{ownRight === 'carrier_admin' && (
										<Button
											priority="tertiary"
											size="small"
											iconId="fr-icon-delete-bin-line"
											iconPosition="right"
											title={`Supprimer la clé API « ${item.key} ».`}
											className={cx(classes.iconError)}
											onClick={() => handleDeleteKey(item.key)}
										>
											Supprimer
										</Button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{ownRight === 'carrier_admin' && (
				<Button
					priority="secondary"
					iconId="fr-icon-add-line"
					className={fr.cx('fr-mt-1w')}
					iconPosition="left"
					type="button"
					onClick={() => handleCreateKey()}
				>
					Générer une {apiKeys.length !== 0 ? 'nouvelle ' : ''} clé API
				</Button>
			)}
		</>
	);
};

const useStyles = tss.withName(ApiKeyHandler.name).create({
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('10v')
	},
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	},
	infoWrapper: {
		height: 'auto !important'
	},
	keyWrapper: {
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	actionsWrapper: {
		display: 'flex',
		justifyContent: 'end',
		button: {
			marginLeft: '1rem'
		}
	},
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	}
});

export default ApiKeyHandler;
