import { Loader } from '@/src/components/ui/Loader';
import { CustomModalProps } from '@/src/types/custom';
import {
	ButtonWithClosedLog,
	ButtonWithForm,
	FormWithElements
} from '@/src/types/prismaTypesExtended';
import { linksFaqContents } from '@/src/utils/content';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import NoButtonsPanel from '../../Pannels/NoButtonsPanel';
import { ButtonModalType } from '../../ProductButton/ButtonModal';
import ProductButtonCard from '../../ProductButton/ProductButtonCard';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	modal: CustomModalProps;
	handleModalOpening: (modalType: ButtonModalType, button?: any) => void;
	alertText: string;
	isAlertShown: boolean;
	setIsAlertShown: (value: boolean) => void;
	buttons: (ButtonWithForm & ButtonWithClosedLog)[];
	isLoading: boolean;
}

const LinksTab = ({
	form,
	ownRight,
	modal,
	handleModalOpening,
	alertText,
	isAlertShown,
	setIsAlertShown,
	buttons,
	isLoading
}: Props) => {
	const router = useRouter();
	const { cx, classes } = useStyles();
	const linkCreated = router.query.linkCreated as string | undefined;

	const [isLinkCreated, setIsLinkCreated] = useState(linkCreated);

	useEffect(() => {
		if (router.query.linkCreated) {
			const { linkCreated, ...restQuery } = router.query;
			router.replace(
				{
					pathname: router.pathname,
					query: restQuery
				},
				undefined,
				{ shallow: true }
			);
		}
	}, [router.query]);

	if (isLoading) {
		return (
			<div className={fr.cx('fr-grid-row')}>
				<h2 className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-0')}>
					Liens d'intégration
				</h2>
				<div className={cx(classes.loaderContainer)}>
					<Loader />
				</div>
			</div>
		);
	}

	const buttonsList = [
		...buttons
			.filter(b => !b.isDeleted)
			.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
		...buttons
			.filter(b => b.isDeleted)
			.sort(
				(a, b) =>
					(b.deleted_at?.getTime() ?? 0) - (a.deleted_at?.getTime() ?? 0)
			)
	];

	return (
		<div className={fr.cx('fr-grid-row')}>
			<h2 className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-0')}>
				Liens d'intégration
			</h2>
			<div
				className={cx(classes.buttonsGroup, fr.cx('fr-col-12', 'fr-col-md-4'))}
			>
				{ownRight === 'carrier_admin' && !form.isDeleted && (
					<Button
						priority="secondary"
						iconId="fr-icon-add-line"
						iconPosition="right"
						onClick={() => {
							router.push(
								`/administration/dashboard/product/${form.product_id}/forms/${form.id}/new-link`
							);
						}}
					>
						Créer un lien d'intégration
					</Button>
				)}
			</div>

			{isLinkCreated && !isAlertShown ? (
				<Alert
					className={fr.cx('fr-col-12', 'fr-mt-6v')}
					title="Votre lien d’intégration a été créé avec succès !"
					description={
						'Pensez à le coller sur votre site pour rendre votre formulaire visible aux usagers'
					}
					severity="success"
					small
					closable
				/>
			) : (
				<Alert
					className={fr.cx('fr-col-12', 'fr-mt-6v')}
					description={alertText}
					severity="success"
					small
					closable
					isClosed={!isAlertShown}
					onClose={() => {
						setIsAlertShown(false);
						setIsLinkCreated(undefined);
					}}
				/>
			)}

			<div
				className={cx(classes.cardContainer, fr.cx('fr-col-12', 'fr-mt-8v'))}
			>
				{buttons.length === 0 &&
					(!form.isDeleted ? (
						<NoButtonsPanel />
					) : (
						<div
							className={fr.cx('fr-col-12')}
							style={{ display: 'flex', justifyContent: 'center' }}
						>
							<span>Aucun lien d'intégration trouvé</span>
						</div>
					))}
				{buttonsList.map((button, index) => (
					<ProductButtonCard
						key={index}
						button={button}
						onButtonClick={handleModalOpening}
						ownRight={ownRight}
					/>
				))}
			</div>

			<div className={fr.cx('fr-col-12', 'fr-mt-16v')}>
				{linksFaqContents.map((faq, index) => (
					<Accordion key={index} label={faq.title}>
						<div className={cx(classes.accordionContent)}>{faq.children}</div>
					</Accordion>
				))}
			</div>
		</div>
	);
};

const useStyles = tss.withName(LinksTab.name).create({
	cardContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('4v')
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '350px',
		width: '100%'
	},
	buttonsGroup: {
		display: 'flex',
		justifyContent: 'end',
		gap: fr.spacing('4v'),
		alignSelf: 'center',
		button: {
			a: {
				display: 'flex',
				alignItems: 'center'
			}
		},
		[fr.breakpoints.down('md')]: {
			marginTop: fr.spacing('4v'),
			button: {
				width: '100%',
				justifyContent: 'center'
			}
		}
	},
	accordionContent: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('2v'),
		padding: fr.spacing('6v'),
		backgroundColor: fr.colors.decisions.background.contrast.grey.default,
		p: {
			':last-child': {
				marginBottom: 0
			}
		},
		a: {
			display: 'inline-block',
			marginTop: fr.spacing('2v'),
			color: fr.colors.decisions.text.title.blueFrance.default,
			fontSize: '14px'
		}
	}
});

export default LinksTab;
