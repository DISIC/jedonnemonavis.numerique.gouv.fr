import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { ToggleSwitch } from '@codegouvfr/react-dsfr/ToggleSwitch';
import { Product } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';

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
	product: Product;
}

const PublicDataModal = (props: Props) => {
	const { modal, product } = props;
	const { cx, classes } = useStyles();
	const [isPublic, setIsPublic] = useState<boolean>(product.isPublic || false);
	const updateProduct = trpc.product.update.useMutation({});
	const { asPath } = useRouter();
	const origin =
		typeof window !== 'undefined' && window.location.origin
			? window.location.origin
			: '';

	const URL = `${origin}${asPath}`;

	return (
		<modal.Component title="Rendre ces statistiques publiques" size="large">
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col-12')}>
					<p className={fr.cx('fr-my-5v')}>
						En activant le partage public, toutes les personnes disposant du
						lien peuvent consulter la page de statistiques. Elles n’auront pas
						accès aux verbatims.
					</p>
				</div>
				<div className={fr.cx('fr-col-12')}>
					<ToggleSwitch
						inputTitle="the-title"
						label="Autoriser le partage public de ces statistiques"
						labelPosition="right"
						showCheckedHint={true}
						defaultChecked={isPublic}
						onChange={async () => {
							setIsPublic(!isPublic);
							await updateProduct.mutateAsync({
								id: product.id,
								product: {
									...product,
									isPublic: !isPublic
								}
							});
						}}
					/>
				</div>
				{isPublic && (
					<>
						<div className={fr.cx('fr-col-12')}>
							<hr />
						</div>
						<div className={fr.cx('fr-col-12')}>
							Lien public :
							<div
								className={cx(
									classes.cardLink,
									fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')
								)}
							>
								<Link
									className={fr.cx('fr-link')}
									href={`/public/product/${product.id}/stats`}
									target="_blank"
								>
									{`${origin}/public/product/${product.id}/stats`}
								</Link>
								<Button
									priority="tertiary"
									size="small"
									iconId="ri-file-copy-line"
									iconPosition="right"
									onClick={async () => {
										if ('clipboard' in navigator) {
											try {
												await navigator.clipboard.writeText(
													`${origin}/public/product/${product.id}/stats`
												);
												alert('Lien copié dans le presse-papiers');
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
							</div>
						</div>
					</>
				)}
			</div>
		</modal.Component>
	);
};

const useStyles = tss.withName(PublicDataModal.name).create(() => ({
	removeWrapper: {
		display: 'flex',
		justifyContent: 'end'
	},
	cardLink: {
		height: 'auto !important',
		justifyContent: 'space-between',
		flexDirection: 'row'
	}
}));

export default PublicDataModal;
