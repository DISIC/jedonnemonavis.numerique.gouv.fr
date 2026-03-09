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
					src={`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/assets/jdma-modal-widget.js`}
					data-jdma-form-url={process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL}
					data-jdma-button-image={`${process.env.NEXT_PUBLIC_BO_APP_URL}/assets/buttons/button-remark-solid-light.svg`}
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
