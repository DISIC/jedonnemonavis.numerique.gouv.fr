import { Column, Img, Link, Row, Section, Text } from 'react-email';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaInvalidButtonsEmailProps } from './interface';

const formatDate = (date: Date) =>
	date.toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});

export const JdmaInvalidButtonsEmail = ({
	product = {
		id: 0,
		title: 'Service en ligne',
		entityName: "Ministère de l'exemple"
	},
	forms = [
		{
			id: 0,
			title: 'Formulaire de contact',
			links: [
				{ label: 'Lien invalide (identifiant 4801)', reviewCount: 12 },
				{ label: "Aucun lien d'intégration", reviewCount: 3 }
			]
		}
	],
	startDate = new Date(),
	endDate = new Date(),
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaInvalidButtonsEmailProps) => {
	const productUrl = `${baseUrl}/administration/dashboard/product/${product.id.toString()}/forms`;

	return (
		<JdmaLayout
			preview={`Des avis ont été déposés sur des liens d'intégration inexistants du service numérique « ${product.title} »`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				Du {formatDate(startDate)} au {formatDate(endDate)}, des usagers ont
				déposé des avis sur le service numérique «&nbsp;{product.title}&nbsp;»
				depuis des liens d'intégration qui n'existent pas. Ces avis ont bien été
				enregistrés et restent consultables dans vos formulaires.
			</Text>

			<Section style={warningSection}>
				<Row>
					<Column style={imageColumn}>
						<Img
							src={`${baseUrl}/assets/install_picto.png`}
							alt="Attention"
							width={120}
							height={120}
							style={{ display: 'block' }}
						/>
					</Column>
					<Column style={textColumn}>
						<Text style={warningText}>
							Certains boutons "Je donne mon avis" de votre site&nbsp;
							<strong>
								pointent vers des liens d'intégration qui n'existent pas
							</strong>
							.
						</Text>
						<Text style={warningText}>
							Pensez à revoir les codes HTML intégrés sur les pages de votre
							service numérique.
						</Text>
					</Column>
				</Row>
			</Section>

			<Section style={serviceSection}>
				<Text style={tableHeader}>Service numérique</Text>
				<Section style={serviceCard}>
					<Link href={productUrl} target="_blank" style={productLink}>
						{product.title}
					</Link>
					<Text style={entityName}>{product.entityName}</Text>
					{forms.map(form => (
						<Section key={form.id} style={formSection}>
							<Link
								href={`${productUrl}/${form.id.toString()}`}
								target="_blank"
								style={formLink}
							>
								{form.title}
							</Link>
							{form.links.map(link => (
								<Text key={link.label} style={linkRow}>
									{link.label} : {link.reviewCount} avis
								</Text>
							))}
						</Section>
					))}
				</Section>
			</Section>

			<Link
				href={`${baseUrl}/administration/dashboard/products`}
				target="_blank"
				style={dashboardLink}
			>
				Retrouvez tous vos services numériques sur votre tableau de bord JDMA
			</Link>
		</JdmaLayout>
	);
};

export default JdmaInvalidButtonsEmail;

const paragraph: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	color: '#333333',
	marginBottom: '16px'
};

const warningSection: React.CSSProperties = {
	backgroundColor: '#ECECFE',
	padding: '18px',
	marginTop: '16px',
	marginBottom: '16px',
	borderRadius: '4px'
};

const imageColumn: React.CSSProperties = {
	verticalAlign: 'middle',
	width: '120px'
};

const textColumn: React.CSSProperties = {
	verticalAlign: 'middle',
	paddingLeft: '18px'
};

const warningText: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '1.5',
	color: '#333333',
	margin: '0 0 12px 0'
};

const serviceSection: React.CSSProperties = {
	marginBottom: '24px'
};

const tableHeader: React.CSSProperties = {
	textAlign: 'left' as const,
	fontSize: '14px',
	fontWeight: 'bolder' as const
};

const serviceCard: React.CSSProperties = {
	border: '1px solid #e0e0e0',
	padding: '16px',
	marginTop: '10px',
	borderRadius: '4px'
};

const productLink: React.CSSProperties = {
	fontSize: '14px',
	lineHeight: '20px',
	color: '#000091',
	textDecoration: 'none',
	fontWeight: 'bold' as const,
	display: 'block'
};

const entityName: React.CSSProperties = {
	fontSize: '14px',
	color: '#666',
	marginTop: '4px',
	marginBottom: '12px'
};

const formSection: React.CSSProperties = {
	backgroundColor: '#F5F5FE',
	padding: '12px',
	marginTop: '12px',
	borderRadius: '4px'
};

const formLink: React.CSSProperties = {
	color: '#000091',
	textDecoration: 'none',
	fontSize: '14px',
	fontWeight: 'bold' as const
};

const linkRow: React.CSSProperties = {
	fontSize: '14px',
	color: '#333333',
	margin: '8px 0 0 0'
};

const dashboardLink: React.CSSProperties = {
	fontSize: '14px',
	color: '#000091',
	textDecoration: 'underline',
	display: 'block',
	marginTop: '16px'
};
