import LinkEditorFlow from '@/src/components/dashboard/ProductButton/LinkEditorFlow';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import { getServerSideProps } from '../..';

interface Props {
	product: ProductWithForms;
}

const NewLinkPage = ({ product }: Props) => {
	return <LinkEditorFlow product={product} mode="create" />;
};

export default NewLinkPage;

export { getServerSideProps };
