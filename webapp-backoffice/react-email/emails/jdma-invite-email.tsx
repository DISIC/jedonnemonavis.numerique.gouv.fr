import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';

interface JdmaInviteEmailProps {
	inviterName: string;
	productTitle?: string;
	entityName?: string;
	baseUrl?: string;
}
const JdmaInviteEmail = ({
	inviterName = 'Jean Dupont',
	productTitle,
	entityName,
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaInviteEmailProps) => {
	const accessType = productTitle
		? `la démarche « ${productTitle} »`
		: entityName
			? `l'organisation « ${entityName} »`
			: 'un service';

	const previewText = productTitle
		? `Accès à la démarche ${productTitle}`
		: entityName
			? `Accès à l'organisation ${entityName}`
			: 'Accès à Je donne mon avis';

	return (
		<JdmaLayout preview={previewText} baseUrl={baseUrl}>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				<strong>{inviterName}</strong> vient de vous donner accès à {accessType}{' '}
				sur la plateforme «{' '}
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>{' '}
				».
			</Text>

			<Text style={paragraph}>
				Vous pouvez vous connecter à votre compte en cliquant sur le lien
				ci-dessous.
			</Text>

			<Link href={baseUrl} target="_blank" style={buttonLink}>
				{baseUrl}
			</Link>
		</JdmaLayout>
	);
};

export default JdmaInviteEmail;

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
	wordBreak: 'break-all' as const
};
