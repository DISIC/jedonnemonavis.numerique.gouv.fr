import AccessRightModal from '@/src/components/dashboard/AccessRight/AccessRightModal';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import { AccessRightWithUsers } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';
import { Product } from '@prisma/client';

type RoleType = 'carrier_user' | 'carrier_admin';

type UserToAdd = {
	email: string;
	role: RoleType;
	errorStatus?: number;
};

const modal = createModal({
	id: 'user-product-modal',
	isOpenedByDefault: false
});

const emptyUser: UserToAdd = {
	email: '',
	role: 'carrier_user'
};

interface Props {
	product: Product;
}

const NewAccess = ({ product }: Props) => {
	const { cx, classes } = useStyles();
	const router = useRouter();
	const utils = trpc.useUtils();
	const { id } = router.query;
	const {
		createdProduct,
		createdUserAccesses,
		updateCreatedUserAccesses,
		steps,
		updateSteps,
		reset
	} = useOnboarding();

	const [userToInvite, setUserToInvite] = useState<UserToAdd>(emptyUser);
	const [currentAccessRight, setCurrentAccessRight] =
		useState<AccessRightWithUsers>();
	const [isModalSubmitted, setIsModalSubmitted] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const isEditingStep = useMemo(
		() => steps.find(step => step.slug === 'access')?.isEditing,
		[steps]
	);
	const isSkippedStep = useMemo(
		() => steps.find(step => step.slug === 'access')?.isSkipped,
		[steps]
	);
	const [shouldShowStepper, setShouldShowStepper] = useState<boolean>(
		isSkippedStep ||
			(Boolean(createdProduct) &&
				Boolean(createdUserAccesses && createdUserAccesses.length > 0) &&
				!isEditingStep)
	);

	const isModalOpen = useIsModalOpen(modal);

	useEffect(() => {
		setIsMounted(true);
	}, [isMounted]);

	useEffect(() => {
		if (isEditingStep !== undefined) setShouldShowStepper(!isEditingStep);
		if (isSkippedStep) setShouldShowStepper(true);
	}, [isEditingStep, isSkippedStep]);

	const createAccessRightMutation = trpc.accessRight.create.useMutation({
		onSuccess: (createdValue, values) => {
			utils.accessRight.getList.invalidate();
			setUserToInvite(emptyUser);

			updateCreatedUserAccesses([
				...(createdUserAccesses || []),
				{ ...createdValue.data }
			]);

			window._mtm?.push({
				event: 'matomo_event',
				container_type: 'backoffice',
				service_id: createdProduct?.id || 0,
				form_id: 0,
				template_slug: '',
				category: 'service',
				action: 'service_users_add'
			});
		},
		onError: (error, values) => {
			setUserToInvite(prev => ({
				...prev,
				errorStatus: error.data?.httpStatus
			}));
		}
	});

	const createAccessRight = (user: UserToAdd) => {
		return createAccessRightMutation.mutateAsync({
			user_email: user.email,
			role: user.role,
			product_id: Number(id)
		});
	};

	const onSubmit = async () => {
		const hasEmptyEmail = userToInvite.email.trim() === '';
		if (hasEmptyEmail) {
			setUserToInvite(prev => ({
				...prev,
				errorStatus: 400
			}));
			return;
		}

		await createAccessRight(userToInvite);
	};

	const handleRemoveAccess = async (accessRight: AccessRightWithUsers) => {
		setCurrentAccessRight(accessRight);
		setIsModalSubmitted(false);
		if (isMounted) modal.open();
	};

	const getAlertTitle = () => {
		const userName = currentAccessRight?.user
			? `${currentAccessRight.user.firstName} ${currentAccessRight.user.lastName}`
			: currentAccessRight?.user_email_invite;

		return `${userName} ne fait plus partie de ${product.title}.`;
	};

	const onConfirm = async () => {
		if (userToInvite.email.trim() !== '') await onSubmit();
		if (!Boolean(createdProduct)) {
			router.push(`/administration/dashboard/product/${id}/access`).then(() => {
				reset();
			});
			return;
		}

		if (isEditingStep) {
			updateSteps(
				steps.map(step =>
					step.slug === 'access' ? { ...step, isEditing: false } : step
				)
			);
		}
		setShouldShowStepper(true);
		setIsModalSubmitted(false);
	};

	const onSkipAction = () => {
		updateSteps(
			steps.map(step =>
				step.slug === 'access' ? { ...step, isSkipped: true } : step
			)
		);

		window._mtm?.push({
			event: 'matomo_event',
			container_type: 'backoffice',
			service_id: createdProduct?.id || 0,
			form_id: 0,
			template_slug: '',
			category: 'service',
			action: 'user_step_skip'
		});
	};

	return (
		<OnboardingLayout
			title={
				shouldShowStepper
					? 'Étapier parcours de création'
					: 'Inviter des utilisateurs'
			}
			onConfirm={onConfirm}
			onSkip={
				Boolean(createdProduct) &&
				Boolean(!createdUserAccesses || createdUserAccesses.length === 0)
					? onSkipAction
					: undefined
			}
			isStepperLayout={shouldShowStepper}
			confirmText={
				userToInvite.email.trim() !== '' ? 'Inviter et continuer' : undefined
			}
			isConfirmDisabled={
				userToInvite.email.trim() === '' && !createdUserAccesses?.length
			}
		>
			<AccessRightModal
				modal={modal}
				isOpen={isModalOpen}
				modalType={'remove'}
				productId={product.id}
				productName={product.title}
				setIsModalSubmitted={setIsModalSubmitted}
				currentAccessRight={currentAccessRight}
				setCurrentAccessRight={setCurrentAccessRight}
				onSuccess={() => {
					updateCreatedUserAccesses(
						(createdUserAccesses || []).filter(
							access => access.id !== currentAccessRight?.id
						)
					);
				}}
			/>
			{isModalSubmitted && (
				<div role="alert">
					<Alert
						closable
						onClose={function noRefCheck() {
							setIsModalSubmitted(false);
						}}
						severity={'success'}
						className={fr.cx('fr-mb-8v')}
						small
						description={getAlertTitle()}
					/>
				</div>
			)}

			{createdUserAccesses && createdUserAccesses.length > 0 && (
				<div className={classes.alreadyCreatedContainer}>
					<h2 className={fr.cx('fr-text--bold', 'fr-mb-0', 'fr-h6')}>
						Utilisateurs invités
					</h2>
					{createdUserAccesses.map((access, i) => {
						const invitedUserTitle = access.user
							? `${access.user.firstName} ${access.user.lastName}`
							: access.user_email_invite;
						const roleTitle =
							access.status === 'carrier_admin'
								? 'Administrateur'
								: 'Utilisateur';
						return (
							<div
								key={i}
								className={cx(classes.card, fr.cx('fr-card', 'fr-p-2w'))}
							>
								<div
									className={fr.cx(
										'fr-grid-row',
										'fr-grid-row--gutters',
										'fr-grid-row--middle'
									)}
								>
									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-8')}>
										<p
											className={cx(
												classes.title,
												fr.cx('fr-mb-0', 'fr-grid-row', 'fr-grid-row--middle')
											)}
										>
											{invitedUserTitle} - {roleTitle}
										</p>
										{access.user_email && (
											<p
												className={fr.cx('fr-mb-0', 'fr-mt-1v', 'fr-text--xs')}
											>
												{access.user_email}
											</p>
										)}
									</div>

									<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
										<div className={cx(classes.actionsContainer)}>
											<Button
												priority="secondary"
												size="small"
												onClick={() => {
													handleRemoveAccess(access);
												}}
												className="fr-mr-md-2v"
											>
												Retirer l'accès
											</Button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
			<form id="new-access-form">
				<div className={classes.titleContainer}>
					<h2 className={fr.cx('fr-text--bold', 'fr-mb-0', 'fr-h6')}>
						Inviter un utilisateur
					</h2>
				</div>

				<Input
					label={
						<p className={fr.cx('fr-mb-0')}>
							Adresse email <span className={cx(classes.asterisk)}>*</span>
						</p>
					}
					state={userToInvite.errorStatus ? 'error' : 'default'}
					stateRelatedMessage={
						userToInvite.errorStatus == 409
							? "L'utilisateur avec cet email a déja accès à ce service ou à l'oganisation à laquelle appartient ce service."
							: 'Veuillez saisir une adresse email valide.'
					}
					hintText="Format attendu : nom@domaine.fr"
					nativeInputProps={{
						required: true,
						type: 'email',
						value: userToInvite.email,
						onKeyDown: e => {
							if (e.key === 'Enter') {
								e.preventDefault();
								onSubmit();
							}
						},
						onChange: e => {
							setUserToInvite(prev => ({
								...prev,
								email: e.target.value
							}));
						}
					}}
				/>

				<RadioButtons
					legend="Rôle"
					name={'access-role'}
					className={fr.cx('fr-mb-3v')}
					options={[
						{
							label: 'Utilisateur du service',
							hintText:
								'Utilisateurs ayant le droit de voir le service, mais pas de le modifier',
							nativeInputProps: {
								value: 'carrier_user',
								onChange: e => {
									setUserToInvite(prev => ({
										...prev,
										role: e.target.value as RoleType
									}));
								},
								checked: userToInvite.role === 'carrier_user'
							}
						},
						{
							label: 'Administrateur du service',
							hintText:
								'Utilisateurs ayant le droit de modifier tout aspect du service',
							nativeInputProps: {
								value: 'carrier_admin',
								onChange: e => {
									setUserToInvite(prev => ({
										...prev,
										role: e.target.value as RoleType
									}));
								},
								checked: userToInvite.role === 'carrier_admin'
							}
						}
					]}
				/>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--center')}>
					<Button
						iconId="fr-icon-user-add-line"
						priority="primary"
						type="button"
						onClick={onSubmit}
					>
						Inviter
					</Button>
				</div>
			</form>
		</OnboardingLayout>
	);
};

export default NewAccess;

const useStyles = tss.create(() => ({
	titleContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: fr.spacing('4v')
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	alreadyCreatedContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('4v'),
		marginBottom: fr.spacing('8v')
	},
	card: {
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		height: 'auto!important',
		backgroundImage: 'none!important'
	},
	title: {
		fontWeight: 'bold'
	},
	actionsContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'flex-end',

		[fr.breakpoints.down('md')]: {
			paddingLeft: 0,
			flexDirection: 'column',
			justifyContent: 'flex-start',
			gap: fr.spacing('4v'),
			button: {
				width: '100%',
				justifyContent: 'center'
			}
		}
	}
}));

export { getServerSideProps };
