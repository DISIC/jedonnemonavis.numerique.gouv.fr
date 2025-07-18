import { fr } from '@codegouvfr/react-dsfr';
import React from 'react';
import { User, UserSchema } from '@/prisma/generated/zod';
import GenericCardInfos from './genericCardAccount';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import Input from '@codegouvfr/react-dsfr/Input';
import { trpc } from '@/src/utils/trpc';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { tss } from 'tss-react/dsfr';

interface Props {
	user: User;
}

type FormValues = Omit<User, 'id' | 'created_at' | 'updated_at'>;

const IdentityCard = (props: Props) => {
	const { user } = props;
	const { cx, classes } = useStyles();
	const utils = trpc.useUtils();
	const { update: refetchSession } = useSession();
	const router = useRouter();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: { ...user }
	});

	const editUser = trpc.user.update.useMutation({
		onSuccess: async () => {
			utils.user.getById.invalidate({});
			await refetchSession();
			router.replace(router.asPath);
		}
	});

	const onFormSubmit = async () => {
		let isValid = false;
		await handleSubmit(async data => {
			await onLocalSubmit(data);
			isValid = true;
		})();
		return isValid;
	};

	const onLocalSubmit: SubmitHandler<FormValues> = async data => {
		const dataParsed = UserSchema.parse(data);
		const { email, ...updateUser } = dataParsed;
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
				onSubmit={onFormSubmit}
				viewModeContent={
					<>
						<div
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-grid-row--middle'
							)}
						>
							<div className={fr.cx('fr-col-12', 'fr-text--bold')}>
								Prénom(s)
							</div>
							<div className={fr.cx('fr-col-12', 'fr-pt-0', 'fr-mb-4v')}>
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
							<div className={fr.cx('fr-col-12', 'fr-text--bold')}>Nom</div>
							<div className={fr.cx('fr-col-12', 'fr-pt-0')}>
								{user.lastName}
							</div>
						</div>
					</>
				}
				editModeContent={
					<div
						className={fr.cx(
							'fr-grid-row',
							'fr-grid-row--gutters',
							'fr-grid-row--middle'
						)}
					>
						<div className={cx(fr.cx('fr-col-md-6'), classes.formContainer)}>
							<form id="identity-form">
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
														<p className={fr.cx('fr-mb-0', 'fr-text--bold')}>
															Nom
														</p>
													}
													nativeInputProps={{
														onChange: e => {
															onChange(e);
														},
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
						</div>
					</div>
				}
			/>
		</>
	);
};

const useStyles = tss.withName(IdentityCard.name).create(() => ({
	formContainer: {
		[fr.breakpoints.down('md')]: {
			width: '100%'
		}
	}
}));

export default IdentityCard;
