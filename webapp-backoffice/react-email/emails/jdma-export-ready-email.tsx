import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaExportReadyEmailProps } from './interface';

const JdmaExportReadyEmail = ({
	productName = 'Mon service',
	downloadLink = 'https://jedonnemonavis.numerique.gouv.fr',
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaExportReadyEmailProps) => {
	return (
		<JdmaLayout
			preview={`Votre export pour le service « ${productName} » est prêt`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Votre export pour le service{' '}
				<strong>« {productName} »</strong> est prêt. Vous pouvez le
				télécharger en utilisant le lien suivant :
			</Text>

			<Link href={downloadLink} target="_blank" style={buttonLink}>
				Télécharger le fichier
			</Link>

			<Text style={paragraph}>Ce lien expirera dans 7 jours.</Text>
		</JdmaLayout>
	);
};

export default JdmaExportReadyEmail;

// Styles
const paragraph: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	color: '#333333',
	marginBottom: '16px'
};

const buttonLink: React.CSSProperties = {
	color: '#000091',
	textDecoration: 'underline',
	display: 'block',
	marginBottom: '16px'
};
