import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';

interface JdmaProductArchivedEmailProps {
	userName: string;
	productTitle: string;
	baseUrl?: string;
}

export const JdmaProductArchivedEmail = ({
	userName = 'Jean Dupont',
	productTitle = 'Service',
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaProductArchivedEmailProps) => {
	return (
		<JdmaLayout
			preview={`Suppression du service « ${productTitle} »`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				{userName} vient de supprimer le service «{' '}
				<strong>{productTitle}</strong> » sur la plateforme{' '}
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>
				. Vous n'avez plus accès aux avis et commentaires de ce service, et les
				utilisateurs de ce service n'ont plus accès au formulaire.
			</Text>

			<Text style={paragraph}>
				Vous pouvez restaurer ce service depuis{' '}
				<Link
					href={`${baseUrl}/administration/dashboard/products`}
					target="_blank"
					style={linkStyle}
				>
					la page services
				</Link>{' '}
				pendant 6 mois. Après ce délai, le service sera définitivement supprimé.
			</Text>
		</JdmaLayout>
	);
};

export default JdmaProductArchivedEmail;

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
