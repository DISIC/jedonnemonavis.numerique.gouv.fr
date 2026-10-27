import { Button, Link, Section, Text } from 'react-email';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaLinkIssueEmailProps } from './interface';

export const JdmaLinkIssueEmail = ({
	product = { id: 0, title: 'Service en ligne' },
	issues = [
		{
			form: { id: 0, title: 'Formulaire de satisfaction' },
			linkLabel: "Lien d'intégration de la page d'accueil"
		},
		{
			form: { id: 0, title: 'Formulaire de satisfaction' },
			linkLabel: 'Lien invalide (identifiant 1234)'
		}
	],
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaLinkIssueEmailProps) => {
	const productUrl = `${baseUrl}/administration/dashboard/product/${product.id.toString()}/forms`;
	const hasSeveralIssues = issues.length > 1;

	return (
		<JdmaLayout
			preview={`Avis déposés sur un lien d'intégration fermé ou invalide du service numérique « ${product.title} »`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Des utilisateurs ont déposé, ou tenté de déposer, des avis sur{' '}
				<strong>
					{hasSeveralIssues
						? "des liens d'intégration fermés ou invalides."
						: "un lien d'intégration fermé ou invalide."}
				</strong>
			</Text>

			<Text style={paragraph}>
				Pour résoudre le problème,{' '}
				<strong>
					supprimez ou modifiez le code{' '}
					{hasSeveralIssues
						? "de ces liens d'intégration"
						: "du lien d'intégration"}
				</strong>{' '}
				de votre site en ligne, ou créez un nouveau lien si vous souhaitez
				garder une récolte d'avis à cet endroit.
			</Text>

			<Text style={paragraph}>
				Service : <strong>{product.title}</strong>
			</Text>

			<ul style={list}>
				{issues.map(({ form, linkLabel }) => (
					<li key={`${form.id}-${linkLabel}`} style={listItem}>
						Formulaire « {form.title} » :{' '}
						<Link
							href={`${productUrl}/${form.id.toString()}?tab=links`}
							target="_blank"
						>
							{linkLabel}
						</Link>
					</li>
				))}
			</ul>

			<Section style={ctaSection}>
				<Button href={productUrl} style={ctaButton}>
					Voir les formulaires du service
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
