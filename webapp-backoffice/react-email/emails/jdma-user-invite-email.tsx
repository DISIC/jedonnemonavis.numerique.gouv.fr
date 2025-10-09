import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';

interface JdmaUserInviteEmailProps {
	inviterName?: string;
	recipientEmail?: string;
	inviteToken?: string;
	productTitle?: string;
	entityName?: string;
}

const baseUrl =
	process.env.NODEMAILER_BASEURL ||
	'https://jedonnemonavis.numerique.gouv.fr';

export const JdmaUserInviteEmail = ({
	inviterName = 'Jean Dupont',
	recipientEmail = 'user@example.com',
	inviteToken = 'example-token-123',
	productTitle,
	entityName
}: JdmaUserInviteEmailProps) => {
	const link = `${baseUrl}/register?email=${encodeURIComponent(recipientEmail)}&inviteToken=${inviteToken}`;

	const accessType = productTitle
		? `la démarche « ${productTitle} »`
		: entityName
			? `l'organisation « ${entityName} »`
			: 'un service';

	const previewText = productTitle
		? `Invitation à rejoindre la démarche ${productTitle}`
		: entityName
			? `Invitation à rejoindre l'organisation ${entityName}`
			: 'Invitation à rejoindre Je donne mon avis';

	return (
		<JdmaLayout preview={previewText}>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				<strong>{inviterName}</strong> vous invite à rejoindre la plateforme «{' '}
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>{' '}
				» et vous donne accès à {accessType}. Afin de créer votre compte,
				veuillez cliquer sur le lien ci-dessous.
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
