import { Loader } from '@/src/components/ui/Loader';
import { CustomModalProps } from '@/src/types/custom';
import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { tss } from 'tss-react/dsfr';
import NoButtonsPanel from '../../Pannels/NoButtonsPanel';
import { ButtonModalType } from '../../ProductButton/ButtonModal';
import ProductButtonCard from '../../ProductButton/ProductButtonCard';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Accordion from '@codegouvfr/react-dsfr/Accordion';
import { linksFaqContents } from '@/src/utils/content';

interface Props {
	form: FormWithElements;
	ownRight: Exclude<RightAccessStatus, 'removed'>;
	modal: CustomModalProps;
	handleModalOpening: (modalType: ButtonModalType, button?: any) => void;
	alertText: string;
	isAlertShown: boolean;
	setIsAlertShown: (value: boolean) => void;
}

const LinksTab = ({
	form,
	ownRight,
	modal,
	handleModalOpening,
	alertText,
	isAlertShown,
	setIsAlertShown
}: Props) => {
	const router = useRouter();
	const { cx, classes } = useStyles();

	const isModalOpen = useIsModalOpen(modal);

	useEffect(() => {
		if (router.query.shouldOpenButtonModal) {
			handleModalOpening('create');
		}
	}, [router.query]);

	useEffect(() => {
		if (!isModalOpen && router.query.shouldOpenButtonModal) {
			const { shouldOpenButtonModal, ...restQuery } = router.query;
			router.replace(
				{
					pathname: router.pathname,
					query: restQuery
				},
				undefined,
				{ shallow: true }
			);
		}
	}, [isModalOpen]);

	const {
		data: buttonResults,
		isLoading: isLoadingButtons,
		isRefetching: isRefetchingButtons
	} = trpc.button.getList.useQuery(
		{
			page: 1,
			numberPerPage: 1000,
			form_id: form.id,
			isTest: false
		},
		{
			initialData: {
				data: [],
				metadata: {
					count: 0
				}
			}
		}
	);

	if (isLoadingButtons || isRefetchingButtons) {
		return (
			<div className={cx(classes.loaderContainer)}>
				<Loader />
			</div>
		);
	}

	const {
		data: buttons,
		metadata: { count: buttonsCount }
	} = buttonResults;

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
			<Alert
				className={fr.cx('fr-col-12', 'fr-mb-6v')}
				description={alertText}
				severity="success"
				small
				closable
				isClosed={!isAlertShown}
				onClose={() => setIsAlertShown(false)}
			/>
			<h3 className={fr.cx('fr-col-12', 'fr-col-md-8', 'fr-mb-0')}>
				Lien d'intégration
			</h3>
			<div
				className={cx(classes.buttonsGroup, fr.cx('fr-col-12', 'fr-col-md-4'))}
			>
				{ownRight === 'carrier_admin' && !form.isDeleted && (
					<Button
						priority="secondary"
						iconId="fr-icon-add-line"
						iconPosition="right"
						onClick={() => {
							handleModalOpening('create');
						}}
					>
						Créer un lien d'intégration
					</Button>
				)}
			</div>

			<div
				className={cx(classes.cardContainer, fr.cx('fr-col-12', 'fr-mt-8v'))}
			>
				{buttonsCount === 0 &&
					(!form.isDeleted ? (
						<NoButtonsPanel
							onButtonClick={() => handleModalOpening('create')}
						/>
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
		alignItems: 'start',
		height: '500px',
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
