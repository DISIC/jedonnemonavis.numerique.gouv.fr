import { Button, Hr, Link, Section, Text } from 'react-email';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaAlertEmailProps } from './interface';

const formatNumber = (num: number) => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const JdmaAlertEmail = ({
	userId = 1,
	productTitle = 'Service de démonstration',
	formTitle = 'Formulaire de satisfaction',
	totalNbReviews = 3,
	nbReviewsWithComments = 2,
	reviewsUrl = 'https://jedonnemonavis.numerique.gouv.fr/administration/dashboard/product/1/forms/1?tab=reviews',
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaAlertEmailProps) => {
	const reviewsLabel =
		totalNbReviews === 1 ? 'nouvelle réponse' : 'nouvelles réponses';
	const formattedTotal = formatNumber(totalNbReviews);

	return (
		<JdmaLayout
			preview={`${formattedTotal} ${reviewsLabel} sur le formulaire ${formTitle}`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Vous avez reçu&nbsp;
				<strong>
					{formattedTotal} {reviewsLabel}
				</strong>
				{' nécessitant votre attention sur le formulaire '}
				<strong>{formTitle}</strong>
				{' du service '}
				<strong>{productTitle}</strong>
				{nbReviewsWithComments > 0
					? `, dont ${formatNumber(nbReviewsWithComments)} avec ${
							nbReviewsWithComments === 1 ? 'commentaire' : 'commentaires'
					  }.`
					: '.'}
			</Text>

			<Section style={ctaSection}>
				<Button href={reviewsUrl} style={ctaButton}>
					Voir les nouvelles réponses
				</Button>
			</Section>

			<Hr style={hr} />

			<Text style={paragraph}>
				Pour changer la fréquence de cette alerte ou ne plus la recevoir du
				tout,&nbsp;
				<Link
					href={`${baseUrl}/administration/dashboard/user/${userId}/notifications`}
					target="_blank"
					style={linkStyle}
				>
					modifiez vos paramètres de notification
				</Link>
				.
			</Text>
		</JdmaLayout>
	);
};

export default JdmaAlertEmail;

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

const ctaSection: React.CSSProperties = {
	textAlign: 'center' as const,
	marginTop: '24px',
	marginBottom: '24px'
};

const ctaButton: React.CSSProperties = {
	backgroundColor: '#000091',
	color: '#ffffff',
	fontSize: '14px',
	fontWeight: 'bold',
	padding: '10px 20px',
	textDecoration: 'none',
	display: 'inline-block'
};

const hr: React.CSSProperties = {
	borderColor: '#e0e0e0',
	marginTop: '24px',
	marginBottom: '24px'
};
