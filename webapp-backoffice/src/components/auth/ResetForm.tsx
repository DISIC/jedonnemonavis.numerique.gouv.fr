import { isValidEmail } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { PasswordInput, PasswordInputProps } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { tss } from 'tss-react/dsfr';
import { Loader } from '../ui/Loader';
import { get } from 'http';

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
    const [successChange, setSuccessChange] = useState<Boolean>(false)
    const { classes, cx } = useStyles({
		errors,
		isLoading: false
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

    const resetPassword = trpc.user.changePAssword.useMutation({
        onSuccess: () => {
            setSuccessChange(true)
        }
    });

    const sendNewPassword = () => {
        resetPassword.mutate({
            token: router.query.token as string,
            password: userInfos.password
        });
    }

    console.log(router.query.token)

	return (
		<div>
			<h4>Mot de passe oublié</h4>
            {!successChange && 
                <>
                    <h5>Veuillez renseigner votre nouveau mot de passe</h5>
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
                                    console.log(getPasswordMessages())
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
			{successChange && 
                <>
                    <p>Votre mot de passe a bien été réinitialisé.</p>
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
    .withParams<{ errors: FormErrors; isLoading: boolean }>()
    .create(({ errors, isLoading }) => ({
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
        }
}));
