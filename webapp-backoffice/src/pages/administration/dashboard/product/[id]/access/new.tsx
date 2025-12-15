import AccessRightModal from '@/src/components/dashboard/AccessRight/AccessRightModal';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import { AccessRightWithUsers } from '@/src/types/prismaTypesExtended';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { useRouter } from 'next/router';
import React, { Fragment, useEffect, useMemo } from 'react';
import { tss } from 'tss-react/dsfr';

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

const NewAccess = () => {
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

	const [usersToAdd, setUsersToAdd] = React.useState<UserToAdd[]>([
		{
			email: '',
			role: 'carrier_user'
		}
	]);
	const [currentAccessRight, setCurrentAccessRight] =
		React.useState<AccessRightWithUsers>();
	const [isModalSubmitted, setIsModalSubmitted] = React.useState(false);

	const isEditingStep = useMemo(
		() => steps.find(step => step.slug === 'access')?.isEditing,
		[steps]
	);

	const isModalOpen = useIsModalOpen(modal);

	const shouldShowStepper =
		Boolean(createdProduct) &&
		Boolean(createdUserAccesses && createdUserAccesses.length > 0) &&
		!isEditingStep;

	useEffect(() => {
		if (usersToAdd.length === 0) {
			if (!Boolean(createdProduct)) {
				router.push(`/administration/dashboard/product/${id}/access`);
				reset();
				return;
			}

			if (isEditingStep) {
				updateSteps(
					steps.map(step =>
						step.slug === 'access' ? { ...step, isEditing: false } : step
					)
				);
			}
		}
	}, [usersToAdd]);

	useEffect(() => {
		if (isEditingStep && usersToAdd.length === 0) {
			setUsersToAdd([
				{
					email: '',
					role: 'carrier_user'
				}
			]);
		}
	}, [isEditingStep]);

	const createAccessRightMutation = trpc.accessRight.create.useMutation({
		onSuccess: (createdValue, values) => {
			utils.accessRight.getList.invalidate();
			setUsersToAdd(prev => {
				const newUsers = prev.filter(
					u => !(u.email === values.user_email && u.role === values.role)
				);
				return newUsers;
			});
			updateCreatedUserAccesses([
				...(createdUserAccesses || []),
				{ ...createdValue.data }
			]);
		},
		onError: (error, values) => {
			setUsersToAdd(prev => {
				const newUsers = [...prev];
				const index = newUsers.findIndex(
					u => u.email === values.user_email && u.role === values.role
				);
				if (index !== -1) {
					newUsers[index].errorStatus = error.data?.httpStatus;
				}
				return newUsers;
			});
		}
	});

	const createAccessRight = (user: UserToAdd) => {
		createAccessRightMutation.mutate({
			user_email: user.email,
			role: user.role,
			product_id: Number(id)
		});
	};

	const onSubmit = () => {
		const hasEmptyEmail = usersToAdd.some(user => user.email.trim() === '');
		if (hasEmptyEmail) {
			setUsersToAdd(prev => {
				return prev.map(user => {
					if (user.email.trim() === '') {
						return { ...user, errorStatus: 400 };
					}
					return { ...user, errorStatus: undefined };
				});
			});
			return;
		}

		usersToAdd.forEach(user => {
			createAccessRight(user);
		});
	};

	const handleRemoveAccess = async (accessRight: AccessRightWithUsers) => {
		setCurrentAccessRight(accessRight);
		setIsModalSubmitted(false);
		modal.open();
	};

	return (
		<OnboardingLayout
			title={
				shouldShowStepper
					? 'Étapier parcours de création'
					: 'Inviter des utilisateurs'
			}
			onConfirm={onSubmit}
			isStepperLayout={shouldShowStepper}
		>
			{createdProduct && (
				<AccessRightModal
					modal={modal}
					isOpen={isModalOpen}
					modalType={'remove'}
					productId={createdProduct.id}
					productName={createdProduct.title}
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
				{usersToAdd.map((user, i) => (
					<Fragment key={i}>
						<div className={classes.titleContainer}>
							<h2 className={fr.cx('fr-text--bold', 'fr-mb-0', 'fr-h6')}>
								Personne {i + (createdUserAccesses?.length || 0) + 1}
							</h2>
							{i > 0 && (
								<Button
									size="small"
									iconId="fr-icon-delete-line"
									priority="tertiary"
									iconPosition="right"
									type="button"
									onClick={() => {
										setUsersToAdd(prev => {
											const newUsers = [...prev];
											newUsers.splice(i, 1);
											return newUsers;
										});
									}}
								>
									Supprimer
								</Button>
							)}
						</div>

						<Input
							label={
								<p className={fr.cx('fr-mb-0')}>
									Adresse email <span className={cx(classes.asterisk)}>*</span>
								</p>
							}
							state={user.errorStatus ? 'error' : 'default'}
							stateRelatedMessage={
								user.errorStatus == 409
									? "L'utilisateur avec cet email a déja accès à ce service ou à l'oganisation à laquelle appartient ce service."
									: 'Veuillez saisir une adresse email valide.'
							}
							hintText="Format attendu : nom@domaine.fr"
							nativeInputProps={{
								required: true,
								type: 'email',
								value: user.email,
								onKeyDown: e => {
									if (e.key === 'Enter') {
										e.preventDefault();
										onSubmit();
									}
								},
								onChange: e =>
									setUsersToAdd(prev => {
										const newUsers = [...prev];
										newUsers[i].email = e.target.value;
										return newUsers;
									})
							}}
						/>

						<RadioButtons
							legend="Rôle"
							name={'access-role-' + i}
							className={fr.cx('fr-mb-3v')}
							options={[
								{
									label: 'Utilisateur du service',
									hintText:
										'Utilisateurs ayant le droit de voir le service, mais pas de le modifier',
									nativeInputProps: {
										value: 'carrier_user',
										onChange: e => {
											setUsersToAdd(prev => {
												const newUsers = [...prev];
												newUsers[i].role = e.target.value as RoleType;
												return newUsers;
											});
										},
										checked: user.role === 'carrier_user'
									}
								},
								{
									label: 'Administrateur du service',
									hintText:
										'Utilisateurs ayant le droit de modifier tout aspect du service',
									nativeInputProps: {
										value: 'carrier_admin',
										onChange: e => {
											setUsersToAdd(prev => {
												const newUsers = [...prev];
												newUsers[i].role = e.target.value as RoleType;
												return newUsers;
											});
										},
										checked: user.role === 'carrier_admin'
									}
								}
							]}
						/>
						<hr />
						{i === usersToAdd.length - 1 && (
							<Button
								size="small"
								iconId="fr-icon-user-add-line"
								priority="tertiary"
								type="button"
								onClick={() => {
									setUsersToAdd(prev => [
										...prev,
										{
											email: '',
											role: 'carrier_user'
										}
									]);
								}}
							>
								Ajouter un collaborateur
							</Button>
						)}
					</Fragment>
				))}
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
