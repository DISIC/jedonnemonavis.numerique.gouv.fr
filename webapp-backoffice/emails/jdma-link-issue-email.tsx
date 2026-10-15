import { Button, Section, Text } from 'react-email';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaLinkIssueEmailProps } from './interface';

export const JdmaLinkIssueEmail = ({
	product = { id: 0, title: 'Service en ligne' },
	form = { id: 0, title: 'Formulaire de satisfaction' },
	linkLabel = "Lien d'intégration de la page d'accueil",
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaLinkIssueEmailProps) => {
	const linksUrl = `${baseUrl}/administration/dashboard/product/${product.id.toString()}/forms/${form.id.toString()}?tab=links`;

	return (
		<JdmaLayout
			preview={`Avis déposés sur un lien d'intégration fermé ou invalide du service numérique « ${product.title} »`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Des utilisateurs ont déposé, ou tenté de déposer, un avis sur un{' '}
				<strong>lien d'intégration fermé ou invalide.</strong>
			</Text>

			<Text style={paragraph}>
				Pour résoudre le problème,{' '}
				<strong>supprimez ou modifiez le code du lien d'intégration</strong> de
				votre site en ligne, ou créez un nouveau lien si vous souhaitez garder
				une récolte d'avis à cet endroit.
			</Text>

			<ul style={list}>
				<li style={listItem}>Service : {product.title}</li>
				<li style={listItem}>Formulaire : {form.title}</li>
				<li style={listItem}>Lien d'intégration : {linkLabel}</li>
			</ul>

			<Section style={ctaSection}>
				<Button href={linksUrl} style={ctaButton}>
					Voir le lien d'intégration concerné
				</Button>
			</Section>
		</JdmaLayout>
	);
};

export default JdmaLinkIssueEmail;

const paragraph: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	color: '#333333',
	marginBottom: '16px'
};

const list: React.CSSProperties = {
	paddingLeft: '20px',
	margin: '0 0 16px 0'
};

const listItem: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	color: '#333333'
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
	padding: '10px 20px',
	textDecoration: 'none',
	display: 'inline-block'
};
