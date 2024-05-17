import React from 'react';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { getServerSideProps } from '.';
import { Product } from '@prisma/client';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import Tag from '@codegouvfr/react-dsfr/Tag';
import ProductModal from '@/src/components/dashboard/Product/ProductModal';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useRouter } from 'next/router';
import { Toast } from '@/src/components/ui/Toast';
import Link from 'next/link';
import { Loader } from '@/src/components/ui/Loader';

interface Props {
	product: Product;
}

const ProductApiKeysPage = (props: Props) => {
	const { product } = props;
	const { cx, classes } = useStyles();

	const router = useRouter();

	const [displayToast, setDisplayToast] = React.useState(false);

	const {
		data: resultApiKey,
		isLoading: isLoadingKeys,
		refetch: RefectchKeys
	} = trpc.apiKey.getList.useQuery(
		{
            product_id: product.id
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
            product_id: product.id
        });
		RefectchKeys();
	};

	const handleDeleteKey = async (key: string) => {
		if (confirm('Êtes vous sûr de vouloir supprimer cette clé ?')) {
			await deleteKey.mutateAsync({ key: key });
			RefectchKeys();
		}
	};

	return (
		<ProductLayout product={product}>
			<Toast
				isOpen={displayToast}
				setIsOpen={setDisplayToast}
				autoHideDuration={2000}
				severity="info"
				message="Clé copiée dans le presse papier !"
			/>
            <div className={classes.headerWrapper}>
                <h1>Gérer les clés API</h1>
				<Link className={fr.cx('fr-link')} target="_blank" href="/open-api">
					Voir la documentation de l'API
				</Link>
            </div>
            <h3 className={fr.cx('fr-mt-10v')}>Clés API</h3>
            {isLoadingKeys ? (
				<div className={fr.cx('fr-py-20v', 'fr-mt-4w')}>
					<Loader />
				</div>
			) : (
				apiKeys.map((key, index) => (
					<div className={cx(fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w'), classes.keyWrapper)} key={index}>
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
									classes.actionsWrapper
								)}
							>
                                <Button
                                    priority="tertiary"
                                    size="small"
                                    iconId="ri-file-copy-line"
                                    iconPosition="right"
                                    onClick={async () => {
                                        if ('clipboard' in navigator) {
                                            try {
                                                await navigator.clipboard.writeText(key.key);
                                                setDisplayToast(true);
                                            } catch (err) {
                                                alert(err);
                                            }
                                        } else {
                                            alert('Fonctionnalité de presse-papiers non prise en charge');
                                        }
                                    }}
                                >
                                    {'Copier'}
                                </Button>
								<Button
									priority="tertiary"
									size="small"
									iconId="fr-icon-delete-bin-line"
									iconPosition="right"
									className={cx(classes.iconError)}
									onClick={() => handleDeleteKey(key.key)}
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
				Générer une {apiKeys.length !== 0 ? 'nouvelle ' : ''} clé API
			</Button>
		</ProductLayout>
	);
};

const useStyles = tss.withName(ProductApiKeysPage.name).create({
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
    keyWrapper: {
        height: 'auto !important'
    },
	actionsWrapper: {
		display: 'flex',
		justifyContent: 'end',
        'button': {
            marginLeft: '1rem'
        }
	},
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	}
});

export default ProductApiKeysPage;

export { getServerSideProps };
