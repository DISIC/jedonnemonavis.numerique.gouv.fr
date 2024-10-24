import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { tss } from 'tss-react/dsfr';
import { User } from '@/prisma/generated/zod';
import GenericCardInfos from './genericCardAccount';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Input from '@codegouvfr/react-dsfr/Input';
import { trpc } from '@/src/utils/trpc';

interface Props {
	user: User;
}

type FormValues = Omit<User, 'id' | 'created_at' | 'updated_at'>;

const IdentityCard = (props: Props) => {
	const { user } = props;
	const { cx, classes } = useStyles();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: { ...user }
	});

	const editUser = trpc.user.update.useMutation({
		onSuccess: () => {}
	});

	const onLocalSubmit: SubmitHandler<FormValues> = async data => {
		const { ...updateUser } = data;
		console.log('updatedUser : ', updateUser);
		editUser.mutate({
			id: user.id,
			user: { ...updateUser }
		});
	};

	return (
		<>
			<GenericCardInfos
				title={'Identité'}
				modifiable={true}
				onSubmit={handleSubmit(onLocalSubmit)}
				viewModeContent={
					<>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>
								Prénom(s)
							</div>
							<div className={fr.cx('fr-col-md-12', 'fr-pt-0', 'fr-mb-4v')}>
								{user.firstName}
							</div>
						</div>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-md-12', 'fr-text--bold')}>Nom</div>
							<div className={fr.cx('fr-col-md-12', 'fr-pt-0')}>
								{user.lastName}
							</div>
						</div>
					</>
				}
				editModeContent={
					<form id="product-form">
						<div className={fr.cx('fr-input-group')}>
							<Controller
								control={control}
								name="firstName"
								rules={{ required: 'Ce champ est obligatoire' }}
								render={({ field: { onChange, value, name } }) => {
									return (
										<Input
											label={
												<p className={fr.cx('fr-mb-0', 'fr-text--bold')}>
													Prénom(s)
												</p>
											}
											nativeInputProps={{
												onChange: e => {
													onChange(e);
												},
												defaultValue: value || '',
												value: value || '',
												name,
												required: true
											}}
											state={errors[name] ? 'error' : 'default'}
											stateRelatedMessage={errors[name]?.message}
										/>
									);
								}}
							/>
						</div>
						<div className={fr.cx('fr-input-group')}>
							<Controller
								control={control}
								name="lastName"
								rules={{ required: 'Ce champ est obligatoire' }}
								render={({ field: { onChange, value, name } }) => {
									return (
										<Input
											label={
												<p className={fr.cx('fr-mb-0', 'fr-text--bold')}>Nom</p>
											}
											nativeInputProps={{
												onChange: e => {
													onChange(e);
												},
												defaultValue: value || '',
												value: value || '',
												name,
												required: true
											}}
											state={errors[name] ? 'error' : 'default'}
											stateRelatedMessage={errors[name]?.message}
										/>
									);
								}}
							/>
						</div>
					</form>
				}
			/>
		</>
	);
};

const useStyles = tss.withName(IdentityCard.name).create(() => ({
	actionContainer: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
}));

export default IdentityCard;
