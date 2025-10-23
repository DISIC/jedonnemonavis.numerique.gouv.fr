import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaTokenEmailProps } from './interface';

export const JdmaUserRequestAcceptedEmail = ({
	token = 'example-token-123',
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaTokenEmailProps) => {
	const link = `${baseUrl}/register/validate?${new URLSearchParams({ token })}`;

	return (
		<JdmaLayout
			preview="Votre demande d'accès a été acceptée"
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Votre demande d'accès à la plateforme «&nbsp;
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>
				&nbsp; » a été acceptée. Afin de valider votre compte, veuillez cliquer
				sur le lien ci-dessous.
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

export default JdmaUserRequestAcceptedEmail;

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
