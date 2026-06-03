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
			</body>
		</Html>
	);
};
augmentDocumentWithEmotionCache(Document);
augmentDocumentForDsfr(Document);

export default Document;
