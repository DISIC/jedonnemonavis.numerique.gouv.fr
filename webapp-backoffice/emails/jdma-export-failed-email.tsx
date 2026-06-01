import { Link, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaExportFailedEmailProps } from './interface';

const JdmaExportFailedEmail = ({
	productName = 'Mon service',
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaExportFailedEmailProps) => {
	return (
		<JdmaLayout
			preview={`Votre export pour le service « ${productName} » a échoué`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Nous n&apos;avons pas pu générer votre export pour le service{' '}
				<strong>« {productName} »</strong>.
			</Text>

			<Text style={paragraph}>
				Veuillez réessayer depuis le backoffice. Si le problème persiste,
				contactez-nous à{' '}
				<Link
					href="mailto:experts@design.numerique.gouv.fr"
					style={linkStyle}
				>
					experts@design.numerique.gouv.fr
				</Link>
				.
			</Text>
		</JdmaLayout>
	);
};

export default JdmaExportFailedEmail;

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
