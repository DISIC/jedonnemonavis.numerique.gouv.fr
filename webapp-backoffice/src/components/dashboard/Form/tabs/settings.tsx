import { Loader } from '@/src/components/ui/Loader';
import { getServerSideProps } from '@/src/pages/administration/dashboard/product/[id]/forms/[form_id]';
import {
	ButtonWithClosedLog,
	ButtonWithForm,
	FormWithElements
} from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr, FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { Button as ButtonDSFR } from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { tss } from 'tss-react/dsfr';
import FormDeleteModal from '../FormDeleteModal';

interface Props {
	form: FormWithElements;
	alertText: string;
	isAlertShown: boolean;
	setIsAlertShown: (value: boolean) => void;
	buttons: (ButtonWithForm & ButtonWithClosedLog)[];
	isLoading: boolean;
}

const contents: { iconId: FrIconClassName | RiIconClassName; text: string }[] =
	[
		{
			iconId: 'ri-eye-off-line',
			text: 'Masquez une étape, une question ou une option de réponse'
		},
		{
			iconId: 'fr-icon-edit-line',
			text: 'Éditez le texte d’introduction'
		},
		{
			iconId: 'ri-code-fill',
			text: 'Vos usagers auront directement accès au formulaire modifié, sans nécessité de rééditer le lien d’accès.'
		}
	];

const delete_form_modal = createModal({
	id: 'delete-form-modal',
	isOpenedByDefault: false
});

const SettingsTab = ({
	form,
	alertText,
	isAlertShown,
	setIsAlertShown,
	buttons,
	isLoading
}: Props) => {
	const router = useRouter();
	const { cx, classes } = useStyles();
	const [isCopied, setIsCopied] = useState(false);

	const deleteButton = trpc.button.delete.useMutation();

	const deleteAllButtons = async () => {
		await Promise.all(
			buttons.map(button => {
				const { form, closedButtonLog, ...data } = button;
				return deleteButton.mutateAsync({
					buttonPayload: { ...data, deleted_at: new Date(), isDeleted: true },
					shouldLogEvent: false,
					product_id: form.product_id,
					title: button.title
				});
			})
		);
		router.push(
			`/administration/dashboard/product/${form.product_id}/forms?alert=${encodeURIComponent(`Le formulaire "${form.title || form.form_template.title}" et tous les liens d'intégration associés ont bien été fermés.`)}`
		);
	};

	const displaySettingsContent = () => {
		if (isLoading) {
			return (
				<div className={cx(classes.loaderContainer)}>
					<Loader />
				</div>
			);
		}

		return (
			<>
				<FormDeleteModal
					modal={delete_form_modal}
					form={form}
					onDelete={deleteAllButtons}
				/>
				{!form.product.isTop250 && !form.isDeleted && (
					<>
						<div className={fr.cx('fr-col-12', 'fr-mb-7v')}>
							<span
								className={fr.cx('fr-text--bold')}
								style={{ userSelect: 'none' }}
							>
								Identifiant de formulaire
							</span>
							<span className={fr.cx('fr-ml-2v', 'fr-mr-4v')}>#{form.id}</span>
							<ButtonDSFR
								priority="secondary"
								size="small"
								onClick={() => {
									navigator.clipboard.writeText(form.id.toString());
									setIsCopied(true);
									setTimeout(() => setIsCopied(false), 2000);
								}}
								className="fr-mr-md-2v"
								iconId={isCopied ? 'fr-icon-check-line' : 'ri-file-copy-line'}
								iconPosition="right"
							>
								Copier
							</ButtonDSFR>
						</div>
						<div className={fr.cx('fr-col-12', 'fr-col-md-8')}>
							<h3 className={fr.cx('fr-mb-6v')}>Gérer le formulaire</h3>
						</div>
						<div
							className={cx(classes.container, fr.cx('fr-col-12', 'fr-p-6v'))}
							hidden={!!form.isDeleted}
						>
							<div className={fr.cx('fr-grid-row', 'fr-grid-row--middle')}>
								<div className={fr.cx('fr-col-12', 'fr-mb-3v')}>
									<span className={classes.containerTitle}>
										Éditer le formulaire
									</span>
									<Badge severity="new" className={fr.cx('fr-ml-4v')} small>
										Beta
									</Badge>
								</div>

								{contents.map((content, index) => (
									<div
										key={index}
										className={cx(
											classes.content,
											fr.cx('fr-col-12', 'fr-py-0')
										)}
									>
										<div
											className={cx(
												classes.indicatorIcon,
												cx(fr.cx('fr-mr-md-6v'))
											)}
										>
											<i className={cx(fr.cx(content.iconId), classes.icon)} />
										</div>
										<p>{content.text}</p>
									</div>
								))}

								<div className={cx(classes.buttonsGroup, fr.cx('fr-col-12'))}>
									<ButtonDSFR
										priority="primary"
										iconId="fr-icon-edit-line"
										iconPosition="right"
										size="large"
										onClick={() => {
											router.push(
												`/administration/dashboard/product/${form.product_id}/forms/${form.id}/edit`
											);
										}}
									>
										Éditer le formulaire
									</ButtonDSFR>
								</div>
							</div>
						</div>
						<div
							className={fr.cx(
								form.isDeleted ? 'fr-my-0' : 'fr-my-3w',
								'fr-col-12',
								'fr-card',
								'fr-p-6v'
							)}
						>
							<div className={fr.cx('fr-grid-row', 'fr-grid-row--middle')}>
								{form.isDeleted ? (
									<div
										className={fr.cx('fr-col-12')}
										style={{ display: 'flex', justifyContent: 'center' }}
									>
										<span className={classes.containerTitle}>
											Ce formulaire est fermé
										</span>
									</div>
								) : (
									<>
										<div className="fr-col-8">
											<span className={classes.containerTitle}>
												Fermer le formulaire
											</span>
											<p className={fr.cx('fr-mb-0', 'fr-mt-2v')}>
												Le formulaire n’enregistrera plus de nouvelles réponses.
												Cette action est irréversible.
											</p>
										</div>
										<div
											className={fr.cx('fr-col-4')}
											style={{ display: 'flex', justifyContent: 'end' }}
										>
											<ButtonDSFR
												priority="tertiary"
												iconId="fr-icon-delete-line"
												style={{
													color: fr.colors.decisions.text.default.error.default
												}}
												className={fr.cx('fr-ml-auto')}
												iconPosition="right"
												onClick={() => {
													delete_form_modal.open();
												}}
											>
												Fermer le formulaire
											</ButtonDSFR>
										</div>
									</>
								)}
							</div>
						</div>
					</>
				)}
			</>
		);
	};

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
			<h2 className={fr.cx('fr-col-12', 'fr-mb-7v')}>Paramètres</h2>

			{displaySettingsContent()}
		</div>
	);
};

const useStyles = tss.withName(SettingsTab.name).create({
	container: {
		...fr.spacing('padding', {}),
		background: fr.colors.decisions.artwork.decorative.blueFrance.default,
		a: {
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	},
	loaderContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '500px',
		width: '100%'
	},
	buttonsGroup: {
		display: 'flex',
		justifyContent: 'center',
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
	justifyEnd: {
		justifyContent: 'end'
	},
	content: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: fr.spacing('3v'),
		p: {
			margin: 0
		},
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			marginBottom: fr.spacing('6v')
		}
	},
	indicatorIcon: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '50%',
		backgroundColor: 'white'
	},
	icon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		'::before': {
			'--icon-size': fr.spacing('7v')
		}
	},
	containerTitle: {
		fontWeight: 'bold',
		fontSize: '1.125rem',
		lineHeight: '1.75rem'
	}
});

export default SettingsTab;

export { getServerSideProps };
