import { Form } from '@/prisma/generated/zod';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
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
	onSubmit: (form?: Form) => void;
	user_id: number;
}

type FormValues = Omit<
	Form,
	'id' | 'created_at' | 'updated_at' | 'user_id' | 'link' | 'active'
>;

const FormModal = (props: Props) => {
	const { modal, user_id } = props;
	const { cx, classes } = useStyles();

	const {
		control,
		handleSubmit,
		setError,
		reset,
		formState: { errors }
	} = useForm<FormValues>({
		defaultValues: {}
	});

	const saveFormTmp = trpc.form.create.useMutation({
		onSuccess: () => {
			reset({ title: '' });
			props.onSubmit();
			modal.close();
		},
		onError: e => {
			if (e.data?.httpStatus === 409) {
				setError('title', {
					type: 'Conflict name',
					message: 'Un formulaire avec ce nom existe déjà'
				});
			}
		}
	});

	const onSubmit: SubmitHandler<FormValues> = async data => {
		const tmpForm = data;
		let currentForm;

		try {
			const newForm = await saveFormTmp.mutateAsync({
				...tmpForm,
				user_id: user_id
			});

			currentForm = newForm.data;
		} catch (e) {
			console.error(e);
		}
	};

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
			title={'Ajouter un nouveau formulaire'}
			size="large"
			buttons={[
				{
					children: 'Annuler'
				},
				{
					doClosesModal: false,
					onClick: handleSubmit(onSubmit),
					children: 'Créer un formulaire'
				}
			]}
		>
			<p className={fr.cx('fr-hint-text')}>
				Les champs marqués d&apos;un{' '}
				<span className={cx(classes.asterisk)}>*</span> sont obligatoires.
			</p>
			<form id="form-builder-form">
				<div className={fr.cx('fr-input-group')}>
					<Controller
						control={control}
						name="title"
						rules={{ required: 'Ce champ est obligatoire' }}
						render={({ field: { onChange, value, name } }) => (
							<Input
								label={
									<p className={fr.cx('fr-mb-0')}>
										Nom du formulaire{' '}
										<span className={cx(classes.asterisk)}>*</span>
									</p>
								}
								nativeInputProps={{
									onChange,
									defaultValue: value,
									value
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

const useStyles = tss.withName(FormModal.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	}
}));

export default FormModal;
