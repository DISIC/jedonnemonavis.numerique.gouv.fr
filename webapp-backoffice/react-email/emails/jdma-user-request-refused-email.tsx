import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaUserRequestRefusedEmailProps } from './interface';

export const JdmaUserRequestRefusedEmail = ({
	message,
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaUserRequestRefusedEmailProps) => {
	return (
		<JdmaLayout preview="Votre demande d'accès a été refusée" baseUrl={baseUrl}>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Votre demande d'accès à la plateforme «{' '}
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>{' '}
				» a été refusée.
			</Text>

			{message && (
				<>
					<Text style={paragraph}>Message de l'administrateur :</Text>
					<blockquote style={blockquoteStyle}>{message}</blockquote>
				</>
			)}
		</JdmaLayout>
	);
};

export default JdmaUserRequestRefusedEmail;

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

const blockquoteStyle: React.CSSProperties = {
	backgroundColor: '#f3f3f3',
	margin: '0 0 16px 0',
	padding: '20px',
	borderLeft: '4px solid #cccccc'
};
