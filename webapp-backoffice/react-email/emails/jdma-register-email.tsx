import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';

interface JdmaRegisterEmailProps {
	token?: string;
}

const baseUrl =
	process.env.NODEMAILER_BASEURL ||
	'https://jedonnemonavis.numerique.gouv.fr';

export const JdmaRegisterEmail = ({
	token = 'example-token-123'
}: JdmaRegisterEmailProps) => {
	const link = `${baseUrl}/register/validate?token=${token}`;

	return (
		<JdmaLayout preview="Validez votre compte Je donne mon avis">
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Vous venez de créer un compte sur la plateforme «{' '}
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>{' '}
				». Afin de valider votre compte, veuillez cliquer sur le lien
				ci-dessous.
			</Text>

			<Link href={link} target="_blank" style={buttonLink}>
				{link}
			</Link>

			<Text style={paragraph}>
				Cette étape est obligatoire pour pouvoir vous connecter à votre compte.
				Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet
				e-mail.
			</Text>
		</JdmaLayout>
	);
};

export default JdmaRegisterEmail;

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
