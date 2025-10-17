import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaProductRestoredEmailProps } from './interface';

export const JdmaProductRestoredEmail = ({
	userName = 'Jean Dupont',
	productTitle = 'Service',
	productId = 0,
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaProductRestoredEmailProps) => {
	const productUrl = `${baseUrl}/administration/dashboard/product/${productId.toString()}/forms`;

	return (
		<JdmaLayout
			preview={`Restauration du service « ${productTitle} »`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				{userName} vient de restaurer le service «{' '}
				<strong>{productTitle}</strong> » sur la plateforme{' '}
				<Link href={baseUrl} target="_blank" style={linkStyle}>
					Je donne mon avis
				</Link>
				.
			</Text>

			<Text style={paragraph}>
				Vous pouvez à nouveau{' '}
				<Link href={productUrl} target="_blank" style={linkStyle}>
					accéder aux avis et aux commentaires de ce service
				</Link>
				.
			</Text>
		</JdmaLayout>
	);
};

export default JdmaProductRestoredEmail;

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
