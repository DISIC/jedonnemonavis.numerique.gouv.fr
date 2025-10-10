import { Column, Link, Row, Section, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';

interface FormWithReviews {
	formId: number;
	formTitle: string;
	reviewCount: number;
}

interface ProductWithReviews {
	title: string;
	id: number;
	nbReviews: number;
	entityName?: string;
	forms?: FormWithReviews[];
}

interface JdmaNotificationsEmailProps {
	userId?: number;
	frequency?: 'daily' | 'weekly' | 'monthly';
	totalNbReviews?: number;
	startDate?: Date;
	endDate?: Date;
	products?: ProductWithReviews[];
	baseUrl?: string;
}

const formatNumber = (num: number) => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatDate = (date: Date) => {
	return date.toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
};

export const JdmaNotificationsEmail = ({
	userId = 1,
	frequency = 'daily',
	totalNbReviews = 42,
	startDate = new Date(),
	endDate = new Date(),
	products = [
		{
			id: 1,
			title: 'Service de démonstration',
			nbReviews: 42,
			entityName: 'Direction du Numérique',
			forms: [
				{
					formId: 1,
					formTitle: 'Formulaire de satisfaction',
					reviewCount: 30
				},
				{ formId: 2, formTitle: 'Formulaire de contact', reviewCount: 12 }
			]
		}
	],
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaNotificationsEmailProps) => {
	const getFrequencyLabel = () => {
		switch (frequency) {
			case 'daily':
				return `en date du ${formatDate(startDate)}`;
			case 'weekly':
				return `dans les 7 derniers jours (du ${formatDate(startDate)} au ${formatDate(endDate)})`;
			case 'monthly':
				return `dans le dernier mois calendaire (du ${formatDate(startDate)} au ${formatDate(endDate)})`;
			default:
				return `en date du ${formatDate(startDate)}`;
		}
	};

	return (
		<JdmaLayout
			preview={`${formatNumber(totalNbReviews)} nouveaux avis sur vos services`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Vous avez eu un total de{' '}
				<strong>{formatNumber(totalNbReviews)} réponses</strong>{' '}
				{getFrequencyLabel()} sur vos services dans Je donne mon avis.
			</Text>

			<Section style={tableSection}>
				{/* Table Header */}
				<Row>
					<Column>
						<Text style={tableHeader}>Services</Text>
					</Column>
				</Row>

				{/* Products Table */}
				{products.map(product => (
					<Section key={product.id} style={productRow}>
						<Text style={productTitle}>
							<Link
								href={`${baseUrl}/administration/dashboard/product/${product.id}/forms`}
								target="_blank"
								style={productLink}
							>
								{product.title}
							</Link>
						</Text>

						{product.entityName && (
							<Text style={entityName}>{product.entityName}</Text>
						)}

						{/* Forms list */}
						{product.forms && product.forms.length > 0 && (
							<Section style={formsSection}>
								{product.forms.map(form => (
									<Section key={form.formId} style={formRow}>
										<Text style={formText}>
											<Link
												href={`${baseUrl}/administration/dashboard/product/${product.id}/forms/${form.formId}`}
												target="_blank"
												style={formLink}
											>
												{form.formTitle}
											</Link>
											{'  '}
											<span style={badge}>NOUVELLES RÉPONSES</span>
										</Text>
									</Section>
								))}
							</Section>
						)}
					</Section>
				))}
			</Section>

			<Link
				href={`${baseUrl}/administration/dashboard/products`}
				target="_blank"
				style={dashboardLink}
			>
				Retrouvez tous vos services sur votre tableau de bord JDMA
			</Link>

			<Text style={paragraph}>
				Pour changer la fréquence de cette synthèse ou ne plus la recevoir du
				tout,{' '}
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

export default JdmaNotificationsEmail;

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

const tableSection: React.CSSProperties = {
	marginBottom: '32px'
};

const tableHeader: React.CSSProperties = {
	fontSize: '14px',
	fontWeight: 'bold',
	color: '#333333',
	marginBottom: 0
};

const productRow: React.CSSProperties = {
	border: '1px solid #e0e0e0',
	padding: '16px',
	marginTop: '10px',
	marginBottom: '10px'
};

const productTitle: React.CSSProperties = {
	fontSize: '16px',
	fontWeight: 'bold',
	lineHeight: '24px',
	marginBottom: '4px',
	marginTop: 0
};

const productLink: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '20px',
	color: '#000091',
	textDecoration: 'none'
};

const entityName: React.CSSProperties = {
	fontSize: '14px',
	color: '#666666',
	marginTop: '4px',
	marginBottom: '12px'
};

const formsSection: React.CSSProperties = {
	marginTop: '12px'
};

const formRow: React.CSSProperties = {
	backgroundColor: '#F5F5FE',
	padding: '12px',
	marginBottom: '8px'
};

const formText: React.CSSProperties = {
	margin: 0,
	fontSize: '13px',
	lineHeight: '20px',
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	flexWrap: 'wrap'
};

const formLink: React.CSSProperties = {
	color: '#000091',
	fontSize: '13px',
	textDecoration: 'none',
	fontWeight: 'bold',
	marginRight: '8px'
};

const badge: React.CSSProperties = {
	backgroundColor: '#B8FEC9',
	color: '#18753C',
	borderRadius: '4px',
	padding: '6px',
	margin: 0,
	fontSize: '9px',
	lineHeight: 1,
	fontWeight: 'bold',
	display: 'inline-block',
	whiteSpace: 'nowrap' as const
};

const dashboardLink: React.CSSProperties = {
	fontSize: '14px',
	color: '#000091',
	textDecoration: 'underline',
	display: 'block',
	marginBottom: '16px'
};
