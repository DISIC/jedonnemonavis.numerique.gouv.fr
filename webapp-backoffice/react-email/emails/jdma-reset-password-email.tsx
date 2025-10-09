import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';

interface JdmaResetPasswordEmailProps {
	token?: string;
}

const baseUrl =
	process.env.NODEMAILER_BASEURL ||
	'https://jedonnemonavis.numerique.gouv.fr';

export const JdmaResetPasswordEmail = ({
	token = 'example-token-123'
}: JdmaResetPasswordEmailProps) => {
	const link = `${baseUrl}/reset-password?token=${token}`;

	return (
		<JdmaLayout preview="Réinitialisation de votre mot de passe">
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Vous avez demandé à réinitialiser votre mot de passe sur la plateforme
				«{' '}
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>{' '}
				». Afin de choisir un nouveau mot de passe, veuillez cliquer sur le
				lien ci-dessous.
			</Text>

			<Link href={link} target="_blank" style={buttonLink}>
				{link}
			</Link>

			<Text style={paragraph}>
				Ce lien est valable pour les 15 prochaines minutes. Si vous n'avez pas
				demandé cette réinitialisation, veuillez ignorer cet e-mail.
			</Text>
		</JdmaLayout>
	);
};

export default JdmaResetPasswordEmail;

// Styles
const paragraph: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	color: '#333333',
	marginBottom: '16px'
};

const linkStyle: React.CSSProperties = {
	color: '#000091',
	textDecoration: 'underline'
};

const buttonLink: React.CSSProperties = {
	color: '#000091',
	textDecoration: 'underline',
	display: 'block',
	marginBottom: '16px',
	wordBreak: 'break-all' as const
};
