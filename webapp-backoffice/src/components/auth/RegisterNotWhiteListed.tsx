import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { push } from '@socialgouv/matomo-next';
import { useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../ui/Loader';
import { UserInfos } from './RegisterForm';

type Props = {
	userInfos: UserInfos;
};

export const RegisterNotWhiteListed = (props: Props) => {
	const { userInfos } = props;

	const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
	const [reason, setReason] = useState<string | undefined>();
	const submittedMessageRef = useRef<HTMLDivElement | null>(null);

	const createUserRequest = trpc.userRequest.create.useMutation({
		onSuccess: () => {
			setIsSubmitted(true);
		}
	});

	const { classes, cx } = useStyles({ isLoading: createUserRequest.isLoading });

	const validateRequest = () => {
		createUserRequest.mutate({
			userRequest: {
				reason: reason as string,
				mode: 'whitelist',
				inviteToken: userInfos.inviteToken
			},
			user: {
				firstName: userInfos.firstName,
				lastName: userInfos.lastName,
				email: userInfos.email as string,
				password: userInfos.password as string
			}
		});
	};

	useEffect(() => {
		if (!isSubmitted) return;
		submittedMessageRef.current?.focus();
	}, [isSubmitted]);

	if (isSubmitted) {
		return (
			<div
				ref={submittedMessageRef}
				tabIndex={-1}
				role="status"
				aria-live="polite"
				aria-atomic="true"
			>
				<p className={fr.cx('fr-mb-0')}>
					Votre demande de création de compte a été envoyée avec succès.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h2 className={fr.cx('fr-h5')}>Demande de création de compte</h2>
			<form
				onSubmit={e => {
					e.preventDefault();
					push(['trackEvent', 'BO - Auth', 'Register-Not Whitelisted']);
					validateRequest();
				}}
			>
				<Input
					label="Votre situation"
					textArea
					nativeTextAreaProps={{
						onChange: e => {
							setReason(e.target.value);
						},
						value: reason,
						name: 'reason'
					}}
					state={reason === '' ? 'error' : 'default'}
					stateRelatedMessage={
						"L'explication de votre situation est obligatoire."
					}
				/>
				<Button className={cx(classes.button)} type="submit">
					{createUserRequest.isLoading ? <Loader size="sm" white /> : 'Valider'}
				</Button>
			</form>
		</div>
	);
};

const useStyles = tss
	.withName(RegisterNotWhiteListed.name)
	.withParams<{ isLoading: boolean }>()
	.create(({ isLoading }) => ({
		button: {
			display: 'block',
			marginLeft: 'auto',
			cursor: isLoading ? 'not-allowed' : 'pointer',
			pointerEvents: isLoading ? 'none' : 'auto'
		}
	}));
