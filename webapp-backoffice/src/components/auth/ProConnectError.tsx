import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import Image from 'next/image';
import Link from 'next/link';

export const ProconnectError = () => {
	const { cx, classes } = useStyles();

	return (
		<>
			<div className={cx(fr.cx('fr-grid-row', 'fr-grid-row--center'))}>
				<Image
					src="/assets/technical-error.svg"
					alt="Accès interdit"
					width={120}
					height={120}
					className={fr.cx('fr-col-12', 'fr-col-md-6')}
				/>
				<p
					className={cx(
						classes.textLead,
						fr.cx('fr-text--bold', 'fr-mb-8v', 'fr-mt-4v')
					)}
				>
					Nous ne sommes pas en mesure de valider votre accès avec ProConnect
				</p>
				<p>Veuillez vérifier que votre compte ProConnect est validé.</p>
				<p>
					Je donne mon avis est réservé aux agents publics. Votre compte
					ProConnect doit obligatoirement être associé à une entité publique.
				</p>
			</div>
			<div className={cx(fr.cx('fr-grid-row', 'fr-mb-4v'))}>
				<div className={fr.cx('fr-col-12', 'fr-mb-8v')}>
					<Link
						className={fr.cx('fr-link')}
						target="_blank"
						href="https://proconnect.crisp.help/fr/"
					>
						Accéder au centre d’aide ProConnect
					</Link>
				</div>
				<div className={fr.cx('fr-col-12')}>
					<hr />
					<p className={cx(classes.instructionsText)}>
						Vous pouvez partager votre avis de manière anonyme sur tous les
						sites administratifs dotés du bouton "Je donne mon avis", sans avoir
						besoin de créer un compte.
					</p>
					<p className={cx(classes.instructionsText)}>
						Votre avis est très important. Il permet à l’administration
						concernée d’améliorer son service.
					</p>
					<p className={cx(classes.instructionsText)}>
						Retrouvez toutes les données publiques sur la qualité des services
						publics numériques sur le site{' '}
						<a href="https://observatoire.numerique.gouv.fr/" target="_blank">
							Vos démarches essentielles.
						</a>
					</p>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName(ProconnectError.name).create(({}) => ({
	actionModal: {
		display: 'flex',
		justifyContent: 'space-between'
	},
	instructionsText: {
		...fr.typography[18].style,
		color: fr.colors.decisions.background.flat.grey.default
	},
	textLead: {
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 700,
		lineHeight: '32px'
	}
}));
