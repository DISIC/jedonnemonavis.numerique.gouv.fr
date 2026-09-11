import { Link, Text } from 'react-email';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaInviteEmailProps } from './interface';

const JdmaInviteEmail = ({
	inviterName = 'Jean Dupont',
	productTitle,
	productId,
	entityName,
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaInviteEmailProps) => {
	const serviceUrl =
		productId !== undefined
			? `${baseUrl}/administration/dashboard/product/${productId}`
			: undefined;

	return (
		<JdmaLayout baseUrl={baseUrl}>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				<strong>{inviterName}</strong> vient de vous donner accès à{' '}
				{productTitle ? (
					<>
						la démarche «&nbsp;
						{serviceUrl ? (
							<Link href={serviceUrl} target="_blank" style={linkStyle}>
								{productTitle}
							</Link>
						) : (
							<strong>{productTitle}</strong>
						)}
						&nbsp;»
					</>
				) : entityName ? (
					<>l&apos;organisation «&nbsp;{entityName}&nbsp;»</>
				) : (
					<>un service numérique</>
				)}{' '}
				sur la plateforme «&nbsp;Je donne mon avis&nbsp;».
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
