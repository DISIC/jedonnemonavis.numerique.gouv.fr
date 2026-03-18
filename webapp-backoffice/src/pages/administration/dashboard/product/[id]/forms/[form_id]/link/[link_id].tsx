import LinkEditorFlow from '@/src/components/dashboard/ProductButton/LinkEditorFlow';
import { ProductWithForms } from '@/src/types/prismaTypesExtended';
import { getServerSideProps } from '../..';

interface Props {
	product: ProductWithForms;
}

const EditLinkPage = ({ product }: Props) => {
	return <LinkEditorFlow product={product} mode="edit" />;
};

export default EditLinkPage;

export { getServerSideProps };
