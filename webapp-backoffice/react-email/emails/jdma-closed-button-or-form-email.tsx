import { Column, Img, Link, Row, Section, Text } from '@react-email/components';
import * as React from 'react';
import { JdmaLayout } from './components/JdmaLayout';
import { JdmaClosedButtonOrFormEmailProps } from './interface';

export const JdmaClosedButtonOrFormEmail = ({
	userName = 'Jean Dupont',
	buttonTitle = 'Emplacement Test',
	formTitle,
	form = { id: 0, title: 'Formulaire de satisfaction' },
	product = {
		id: 0,
		title: 'Service en ligne',
		entityName: "Ministère de l'exemple"
	},
	baseUrl = 'https://jedonnemonavis.numerique.gouv.fr'
}: JdmaClosedButtonOrFormEmailProps) => {
	const closeTitle = buttonTitle
		? `l'emplacement « <strong>${buttonTitle}</strong> »`
		: `le formulaire « <strong>${formTitle}</strong> »`;

	const productUrl = `${baseUrl}/administration/dashboard/product/${product.id.toString()}/forms`;
	const formUrl = `${baseUrl}/administration/dashboard/product/${product.id.toString()}/forms/${form.id.toString()}`;

	return (
		<JdmaLayout
			preview={`Fermeture ${buttonTitle ? "d'un emplacement" : "d'un formulaire"} du service « ${product.title} »`}
			baseUrl={baseUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				{userName} vient de fermer&nbsp;
				<span dangerouslySetInnerHTML={{ __html: closeTitle }} /> du service
				«&nbsp;
				{product.title}&nbsp;». Il ne recevra plus de données, mais les
				statistiques récoltées avant la fermeture restent accessibles.
			</Text>

			<Section style={warningSection}>
				<Row>
					<Column style={imageColumn}>
						<Img
							src={`${baseUrl}/assets/install_picto.svg`}
							alt="Attention"
							width={120}
							height={120}
							style={{ display: 'block' }}
						/>
					</Column>
					<Column style={textColumn}>
						<Text style={warningText}>
							Les boutons "Je donne mon avis"&nbsp;
							<strong>sont toujours visibles par les usagers</strong> tant que
							les codes HTML correspondant aux emplacements n'ont pas été
							retirés des pages.
						</Text>
						<Text style={warningText}>
							Pensez à vérifier que c'est le cas sur votre service numérique.
						</Text>
					</Column>
				</Row>
			</Section>

			{buttonTitle && (
				<Section style={serviceSection}>
					<Text style={tableHeader}>Service</Text>
					<Section style={serviceCard}>
						<Link href={productUrl} target="_blank" style={productLink}>
							{product.title}
						</Link>
						<Text style={entityName}>{product.entityName}</Text>
						<Section style={formSection}>
							<Link href={formUrl} target="_blank" style={formLink}>
								{form.title}
							</Link>
						</Section>
					</Section>
				</Section>
			)}

			<Link
				href={`${baseUrl}/administration/dashboard/products`}
				target="_blank"
				style={dashboardLink}
			>
				Retrouvez tous vos services sur votre tableau de bord JDMA
			</Link>
		</JdmaLayout>
	);
};

export default JdmaClosedButtonOrFormEmail;

// Styles
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
	fontSize: '14px'
};

const dashboardLink: React.CSSProperties = {
	fontSize: '14px',
	color: '#000091',
	textDecoration: 'underline',
	display: 'block',
	marginTop: '16px'
};
