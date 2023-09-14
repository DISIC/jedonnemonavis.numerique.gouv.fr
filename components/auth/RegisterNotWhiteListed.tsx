import { useState } from 'react';
import { UserInfos } from './RegisterForm';
import { tss } from 'tss-react/dsfr';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Button } from '@codegouvfr/react-dsfr/Button';

type Props = {
	userInfos: UserInfos;
};

export const RegisterNotWhiteListed = (props: Props) => {
	const { userInfos } = props;
	
	const { classes, cx } = useStyles();

	const [reason, setReason] = useState<string | undefined>();

	return (
		<div>
			<h5>Demande de création de compte</h5>
			<form
				onSubmit={e => {
					e.preventDefault();
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
					Valider
				</Button>
			</form>
		</div>
	);
};

const useStyles = tss
	.withName(RegisterNotWhiteListed.name)
	.withParams()
	.create(() => ({
		button: {
			display: 'block',
			marginLeft: 'auto'
		}
	}));
