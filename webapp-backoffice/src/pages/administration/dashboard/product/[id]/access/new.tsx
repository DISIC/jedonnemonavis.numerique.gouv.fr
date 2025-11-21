import { useOnboarding } from '@/src/contexts/OnboardingContext';
import OnboardingLayout from '@/src/layouts/Onboarding/OnboardingLayout';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
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
		updateSteps
	} = useOnboarding();

	const [usersToAdd, setUsersToAdd] = React.useState<UserToAdd[]>([
		{
			email: '',
			role: 'carrier_user'
		}
	]);

	const isEditingStep = useMemo(
		() => steps.find(step => step.slug === 'access')?.isEditing,
		[steps]
	);

	const shouldShowStepper = useMemo(
		() =>
			Boolean(createdUserAccesses && createdUserAccesses.length > 0) &&
			!isEditingStep,
		[createdUserAccesses, isEditingStep]
	);

	useEffect(() => {
		if (usersToAdd.length === 0) {
			if (!Boolean(createdProduct)) {
				router.push(`/administration/dashboard/product/${id}/access`);
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

	return (
		<OnboardingLayout
			title="Inviter des utilisateurs"
			onConfirm={onSubmit}
			isStepperLayout={shouldShowStepper}
		>
			<form id="new-access-form">
				{usersToAdd.map((user, i) => (
					<Fragment key={i}>
						<div className={classes.titleContainer}>
							<p className={fr.cx('fr-text--bold', 'fr-mb-0')}>
								Personne {i + 1}
							</p>
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
	}
}));
