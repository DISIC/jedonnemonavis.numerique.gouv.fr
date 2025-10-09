import {
	Body,
	Container,
	Head,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text
} from '@react-email/components';
import * as React from 'react';

interface JdmaLayoutProps {
	preview?: string;
	children: React.ReactNode;
}

const baseUrl =
	process.env.NODEMAILER_BASEURL || 'https://jedonnemonavis.numerique.gouv.fr';

export const JdmaLayout = ({ preview, children }: JdmaLayoutProps) => {
	return (
		<Html>
			<Head />
			{preview && <Preview>{preview}</Preview>}
			<Body style={main}>
				<Container style={container}>
					{/* Header with JDMA Banner */}
					<Section style={header}>
						<Img
							src={`${baseUrl}/assets/JDMA_Banner.png`}
							alt="Je donne mon avis"
							style={headerImage}
						/>
					</Section>

					{/* Main Content */}
					<Section style={content}>{children}</Section>

					{/* Footer */}
					<Section style={footer}>
						<Text style={footerText}>
							Ce message est envoyé automatiquement par le site{' '}
							<Link
								href="https://jedonnemonavis.numerique.gouv.fr/"
								target="_blank"
								style={footerLink}
							>
								Je donne mon avis
							</Link>
							, développé par{' '}
							<Link
								href="https://design.numerique.gouv.fr/"
								target="_blank"
								style={footerLink}
							>
								la Brigade d'Intervention Numérique
							</Link>
							, propulsé par la{' '}
							<Link
								href="https://www.numerique.gouv.fr/"
								target="_blank"
								style={footerLink}
							>
								Direction interministérielle du numérique
							</Link>
							.
						</Text>
						<Text style={footerText}>
							Pour toute question, merci de nous contacter à{' '}
							<Link
								href="mailto:contact.jdma@design.numerique.gouv.fr"
								style={footerLink}
							>
								contact.jdma@design.numerique.gouv.fr
							</Link>
							.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
};

// Styles
const main: React.CSSProperties = {
	fontFamily:
		'"Marianne", -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
	fontSize: '14px',
	backgroundColor: '#ffffff'
};

const container: React.CSSProperties = {
	maxWidth: '640px',
	margin: '0 auto',
	padding: '20px'
};

const header: React.CSSProperties = {
	marginBottom: '30px'
};

const headerImage: React.CSSProperties = {
	height: '88px',
	width: 'auto'
};

const content: React.CSSProperties = {
	marginBottom: '30px'
};

const footer: React.CSSProperties = {
	fontSize: '12px',
	padding: '16px 32px',
	backgroundColor: '#F5F5FE',
	marginTop: '30px'
};

const footerText: React.CSSProperties = {
	margin: '8px 0',
	lineHeight: '1.5',
	color: '#666666'
};

const footerLink: React.CSSProperties = {
	color: '#000091',
	textDecoration: 'underline'
};

export default JdmaLayout;
