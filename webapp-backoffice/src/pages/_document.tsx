import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';
import { dsfrDocumentApi } from './_app';
import { augmentDocumentWithEmotionCache } from './_app';

const { getColorSchemeHtmlAttributes, augmentDocumentForDsfr } =
	dsfrDocumentApi;

const Document = (props: DocumentProps) => {
	return (
		<Html {...getColorSchemeHtmlAttributes(props)}>
			<Head />
			<body>
				<Main />
				<NextScript />
				<script
					src="https://jdma-develop.cleverapps.io/Demarches/assets/jdma-modal-widget.js"
					data-jdma-form-url="https://jdma-develop.cleverapps.io/Demarches/avis/3092?button=9171"
					data-jdma-button-image="https://jdma-develop.cleverapps.io/assets/buttons/button-remark-solid-light.svg"
					data-jdma-button-label="Une remarque ?"
					data-jdma-position="bottom-right"
					defer
				></script>
			</body>
		</Html>
	);
};
augmentDocumentWithEmotionCache(Document);
augmentDocumentForDsfr(Document);

export default Document;
