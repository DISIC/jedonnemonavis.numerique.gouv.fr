import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { PasswordInput, PasswordInputProps } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState, useEffect } from 'react';
import { tss } from 'tss-react/dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Loader } from '../ui/Loader';

type FormErrors = {
	password: { required: boolean; format: boolean };
};

type PasswordMessages = {
	severity: PasswordInputProps.Severity;
	message: ReactNode;
}[];

const regexAtLeastOneSpecialCharacter = /[^a-zA-Z0-9\s]/;
const regexAtLeastOneNumber = /\d/;

export const ResetForm = () => {
	const router = useRouter();
    const defaultErrors = {
		password: {
			required: false,
			format: false
		}
	};
	const [errors, setErrors] = useState<FormErrors>({ ...defaultErrors });
    const [successChange, setSuccessChange] = useState<'Ok' | 'Error' | null>(null)
    const { classes, cx } = useStyles({
		errors,
		successChange
	});

	const resetErrors = (key: keyof FormErrors) => {
		setErrors({ ...errors, [key]: defaultErrors[key] });
	};

    const [userInfos, setUserInfos] = useState({
        password: ''
    });
    const [userInfosVerif, setUserInfosVerif] = useState({
        password: ''
    });

	const getPasswordMessages = (): PasswordMessages => {
		const messages: PasswordMessages = [];

		if (errors.password.required) {
			messages.push({
				message: 'Veuillez renseigner un mot de passe.',
				severity: 'error'
			});
			return messages;
		}

		messages.push({
			message: '12 caractères minimum',
			severity: !userInfos.password
				? 'info'
				: userInfos.password.length >= 12
					? 'valid'
					: 'error'
		});

		messages.push({
			message: '1 caractère spécial',
			severity: !userInfos.password
				? 'info'
				: regexAtLeastOneSpecialCharacter.test(userInfos.password)
					? 'valid'
					: 'error'
		});

		messages.push({
			message: '1 chiffre minimum',
			severity: !userInfos.password
				? 'info'
				: regexAtLeastOneNumber.test(userInfos.password)
					? 'valid'
					: 'error'
		});

		return messages;
	};

    const { data: testLink, isLoading: loadingCheck, isError: loadingError } = trpc.user.checkToken.useQuery({
        token: router.query.token as string
    });

    useEffect(() => {
        if (loadingError && !loadingCheck) {
            setSuccessChange('Error');
        }
        console.log('testLink : ', testLink)
    }, [loadingError]);

    const resetPassword = trpc.user.changePAssword.useMutation({
        onSuccess: () => {
            setSuccessChange('Ok')
        },
        onError: () => {
            setSuccessChange('Error')
        }
    });

    const sendNewPassword = () => {
        resetPassword.mutate({
            token: router.query.token as string,
            password: userInfos.password
        });
    }

	return (
		<div>
            {loadingCheck &&
                <Loader size="md" />
            }
            {!successChange && !loadingCheck &&
                <>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            sendNewPassword();
                        }}
                    >

                        <PasswordInput
                            label="Mot de passe"
                            className={cx(classes.password)}
                            nativeInputProps={{
                                onChange: e => {
                                    setUserInfos({ ...userInfos, password: e.target.value });
                                    resetErrors('password');
                                },
                                value: userInfos.password
                            }}
                            messages={getPasswordMessages()}
                            messagesHint={
                                errors.password.required
                                    ? ''
                                    : 'Votre mot de passe doit contenir au moins :'
                            }
                        />

                        <PasswordInput
                            label="Confirmez votre mot de passe"
                            className={cx(classes.password, fr.cx('fr-mt-10v'))}
                            nativeInputProps={{
                                onChange: e => {
                                    setUserInfosVerif({ ...userInfosVerif, password: e.target.value });
                                    resetErrors('password');
                                },
                                value: userInfosVerif.password
                            }}
                            messages={userInfos.password !== userInfosVerif.password ? [{ message: 'Les mots de passe ne correspondent pas.', severity: 'error' }] : []}
                            messagesHint={''}
                        />
                        <Button type="submit" className={cx(classes.button, fr.cx('fr-mt-10v'))}
                            disabled={
                                !userInfos.password ||
                                !userInfosVerif.password ||
                                userInfos.password !== userInfosVerif.password ||
                                getPasswordMessages().some(m => m.severity === 'error')
                            }>
                            Confirmer
                        </Button>
                    </form>
                </>
            }
			{successChange && !loadingCheck &&
                <>
                    {successChange === "Ok" ? 
                        <Alert
                            description="Vous pouvez désormais vous connecter avec votre nouveau mot de passe."
                            severity="success"
                            title="Mot de passe réinitilialisé"
                        />
                    :
                        <Alert
                            description="Ce lien ne semble plus être valide. Vous pouvez relancer la procédure depuis l'écran de connexion."
                            severity="error"
                            title="Lien invalide"
                        />
                    }
                    <Link href="/login" className={fr.cx('fr-my-5w', 'fr-btn')}>
                        Retourner à l'écran de connexion
                    </Link>
                </>
            }
		</div>
	);
};

const useStyles = tss
    .withName(ResetForm.name)
    .withParams<{ errors: FormErrors, successChange: string | null }>()
    .create(({ errors, successChange }) => ({
        button: {
            width: '100%',
            justifyContent: 'center',
            cursor:'pointer',
            pointerEvents:'auto'
        },
        password: {
            marginBottom:
                errors.password.format || errors.password.required
                    ? fr.spacing('5v')
                    : 0
        },
        result: {
            color: successChange === 'Ok' 
                ? fr.colors.decisions.text.default.success.default
                : fr.colors.decisions.text.default.error.default
        }
}));
