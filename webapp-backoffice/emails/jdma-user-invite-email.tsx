import { Link, Text } from 'react-email';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaUserInviteEmailProps } from './interface';

export const JdmaUserInviteEmail = ({
	inviterName = 'Jean Dupont',
	productTitle,
	entityName,
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaUserInviteEmailProps) => {
	const link = `${baseUrl}/login`;

	const accessType = productTitle
		? `la démarche « ${productTitle} »`
		: entityName
		? `l'organisation « ${entityName} »`
		: 'un service numérique';

	return (
		<JdmaLayout baseUrl={baseUrl}>
			<Text style={paragraph}>Bonjour,</Text>
			<Text style={paragraph}>
				<strong>{inviterName}</strong> vous invite à rejoindre la plateforme
				«&nbsp;
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>
				&nbsp; » et vous donne accès à {accessType}. Pour y accéder,
				connectez-vous avec ProConnect en cliquant sur le lien ci-dessous.
			</Text>
			<Link href={link} target="_blank" style={buttonLink}>
				{link}
			</Link>
		</JdmaLayout>
	);
};

export default JdmaUserInviteEmail;

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
