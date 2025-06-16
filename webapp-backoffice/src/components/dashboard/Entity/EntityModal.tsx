import { CustomModalProps } from '@/src/types/custom';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Entity } from '@prisma/client';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { tss } from 'tss-react/dsfr';


interface Props {
	modal: CustomModalProps;
	entity?: Entity;
	onSubmit: (entity?: Entity) => void;
}

type FormValues = Omit<Entity, 'id' | 'urls' | 'created_at' | 'updated_at'> & {
	urls: { value: string }[];
};

const EntityModal = (props: Props) => {
	const { modal, entity } = props;
	const { cx, classes } = useStyles();

	const {
		control,
		handleSubmit,
		setError,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: entity ? entity : {}
	});

	const saveEntityTmp = trpc.entity.create.useMutation({
		onSuccess: () => {
			reset({ name: '', acronym: '' });
			props.onSubmit();
			modal.close();
		},
		onError: e => {
			if (e.data?.httpStatus === 409) {
				setError('name', {
					type: 'Conflict name',
					message: 'Une organisation avec ce nom existe déjà'
				});
			}
		}
	});
	const updateEntity = trpc.entity.update.useMutation({
		onSuccess: () => {
			reset({ name: '', acronym: '' });
			props.onSubmit();
			modal.close();
		},
		onError: e => {
			if (e.data?.httpStatus === 409) {
				setError('name', {
					type: 'Conflict name',
					message: 'Une organisation avec ce nom existe déjà'
				});
			}
		}
	});

	const onSubmit: SubmitHandler<FormValues> = async data => {
		const tmpEntity = data;
		let currentEntity;

		try {
			if (entity && entity.id) {
				await updateEntity.mutateAsync({
					id: entity.id,
					entity: tmpEntity
				});
			} else {
				const entity = await saveEntityTmp.mutateAsync({
					...tmpEntity
				});

				currentEntity = entity.data;
			}

			if (currentEntity) {
				props.onSubmit(currentEntity);
			}
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		if (entity) {
			reset({ ...entity });
		} else {
			reset({ name: '', acronym: '' });
		}
	}, [entity]);

	useIsModalOpen(modal, {
		onConceal: () => {
			reset();
		}
	});

	return (
		<modal.Component
			className={fr.cx(
				'fr-grid-row',
				'fr-grid-row--center',
				'fr-grid-row--gutters',
				'fr-my-0'
			)}
			concealingBackdrop={false}
			title={
				entity && entity.id
					? "Modifier l'organisation"
					: 'Ajouter une organisation'
			}
			size="large"
			buttons={[
				{
					children: 'Annuler'
				},
				{
					doClosesModal: false,
					onClick: handleSubmit(onSubmit),
					children:
						entity && entity.id ? 'Sauvegarder' : 'Créer une organisation'
				}
			]}
		>
			<p className={fr.cx('fr-hint-text')}>
				Les champs marqués d&apos;un{' '}
				<span className={cx(classes.asterisk)}>*</span> sont obligatoires.
			</p>
			<form id="entity-form">
				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="name"
						rules={{ required: 'Ce champ est obligatoire' }}
						render={({ field: { onChange, value, name } }) => (
							<Input
								label={
									<p className={fr.cx('fr-mb-0')}>
										Nom de l'organisation{' '}
										<span className={cx(classes.asterisk)}>*</span>
									</p>
								}
								nativeInputProps={{
									onChange,
									defaultValue: value,
									value,
									name
								}}
								state={errors[name] ? 'error' : 'default'}
								stateRelatedMessage={errors[name]?.message}
							/>
						)}
					/>
				</div>
				<div className={cx(fr.cx('fr-input-group'), classes.acronymGroup)}>
					<Controller
						control={control}
						name="acronym"
						rules={{ required: 'Ce champ est obligatoire' }}
						render={({ field: { onChange, value, name } }) => (
							<Input
								label={
									<p className={fr.cx('fr-mb-0')}>
										Sigle <span className={cx(classes.asterisk)}>*</span>
									</p>
								}
								nativeInputProps={{
									onChange,
									defaultValue: value,
									value,
									name,
									width: '150px'
								}}
								state={errors[name] ? 'error' : 'default'}
								stateRelatedMessage={errors[name]?.message}
							/>
						)}
					/>
				</div>
			</form>
		</modal.Component>
	);
};

const useStyles = tss.withName(EntityModal.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	acronymGroup: {
		'& input': {
			width: 250
		}
	}
}));

export default EntityModal;
