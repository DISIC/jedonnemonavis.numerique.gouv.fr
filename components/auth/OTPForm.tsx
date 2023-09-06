import { fr } from '@codegouvfr/react-dsfr';
import { PasswordInput } from '@codegouvfr/react-dsfr/blocks/PasswordInput';
import Link from 'next/link';
import { tss } from 'tss-react/dsfr';

export const OTPForm = () => {
	const { classes, cx } = useStyles();

	return (
		<div>
			<PasswordInput label="Mot de passe temporaire" />
			<p className={fr.cx('fr-hint-text', 'fr-text--sm')}>
				Si vous ne recevez pas de courriel sous 15 minutes (n’hésitez pas à
				vérifier dans les indésirables),
				<br />
				<Link className={fr.cx('fr-link', 'fr-text--sm')} href="#">
					vous pouvez le renvoyer en cliquant ici
				</Link>
				.
			</p>
		</div>
	);
};

const useStyles = tss
	.withName(OTPForm.name)
	.withParams()
	.create(() => ({
		root: {}
	}));
