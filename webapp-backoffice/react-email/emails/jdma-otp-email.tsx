import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';

interface JdmaOtpEmailProps {
	code: string;
	baseUrl?: string;
}

export const JdmaOtpEmail = ({
	code = '123456',
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaOtpEmailProps) => {
	return (
		<JdmaLayout
			preview="Votre code de connexion à Je donne mon avis"
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Vous vous connectez pour la première fois à la plateforme «{' '}
				<Link href={baseUrl} target="_blank" style={link}>
					Je donne mon avis
				</Link>{' '}
				» avec votre ancien compte{' '}
				<Link
					href="https://observatoire.numerique.gouv.fr/"
					target="_blank"
					style={link}
				>
					Observatoire / Vos démarches essentielles
				</Link>
				. Afin de confirmer votre identité, veuillez utiliser le mot de passe
				temporaire suivant :
			</Text>

			<Text style={codeStyle}>{code}</Text>

			<Text style={paragraph}>
				Ce code est valable pour les 15 prochaines minutes. Si vous n'avez pas
				demandé ce code, veuillez ignorer cet e-mail.
			</Text>
		</JdmaLayout>
	);
};

export default JdmaOtpEmail;

// Styles
const paragraph: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	color: '#333333',
	marginBottom: '16px'
};

const link: React.CSSProperties = {
	color: '#000091',
	textDecoration: 'underline'
};

const codeStyle: React.CSSProperties = {
	fontSize: '36px',
	fontWeight: 'bold',
	margin: '20px 0',
	color: '#000091',
	textAlign: 'center' as const,
	display: 'block'
};
