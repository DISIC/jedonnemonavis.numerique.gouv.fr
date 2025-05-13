import ProductButtonCard from '@/src/components/dashboard/ProductButton/ProductButtonCard';
import ProductLayout from '@/src/layouts/Product/ProductLayout';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { RightAccessStatus } from '@prisma/client';
import { tss } from 'tss-react/dsfr';
import { getServerSideProps } from '..';
import { Pagination } from '../../../../../../components/ui/Pagination';

import NoButtonsPanel from '@/src/components/dashboard/Pannels/NoButtonsPanel';
import ProductFormConfigurationInfo from '@/src/components/dashboard/Product/ProductFormConfigurationInfo';
import ButtonModal from '@/src/components/dashboard/ProductButton/ButtonModal';
import { Loader } from '@/src/components/ui/Loader';
import { useFilters } from '@/src/contexts/FiltersContext';
import {
    ButtonWithForm,
    ProductWithForms
} from '@/src/types/prismaTypesExtended';
import { formatDateToFrenchString, formatNumberWithSpaces, getNbPages } from '@/src/utils/tools';
import { trpc } from '@/src/utils/trpc';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { push } from '@socialgouv/matomo-next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import Link from 'next/link';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';

interface Props {
    product: ProductWithForms;
    ownRight: Exclude<RightAccessStatus, 'removed'>;
}

const modal = createModal({
    id: 'button-modal',
    isOpenedByDefault: false
});

const ProductButtonsPage = (props: Props) => {
    const { product, ownRight } = props;
    const { cx, classes } = useStyles();

    return (
        <ProductLayout product={product} ownRight={ownRight} hideMenu={true}>
            <Head>
                <title>{`${product.title} | Création formulaire | Je donne mon avis`}</title>
                <meta
                    name="description"
                    content={`${product.title} | Création formulaire | Je donne mon avis`}
                />
            </Head>
            <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
                <div className={fr.cx('fr-col-12')}>
                    <h2 className={fr.cx('fr-mb-0')}>Créer un nouveau formulaire</h2>
                </div>
                <div className={fr.cx('fr-col-12')}>
                    <p>Text description lorem ipsum...</p>
                </div>
                
            </div>
            
        </ProductLayout>
    );
};

export default ProductButtonsPage;

const useStyles = tss
    .withName(ProductButtonsPage.name)
    .withParams()
    .create({
        formCard: {
            backgroundColor: fr.colors.decisions.background.contrast.info.default,
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '100%',
            marginLeft: 0,
            marginRight: 0,
            marginBottom: "0.5rem"
        },
        smallText: {
            color: fr.colors.decisions.text.default.grey.default,
            fontSize: "0.8rem"
        },
        headerButtons: {
            display: 'flex',
            justifyContent: 'end',
            gap: fr.spacing('4v'),
            button: {
                a: {
                    display: 'flex',
                    alignItems: 'center'
                }
            }
        },
        rightButtonsWrapper: {
            display: 'flex',
            justifyContent: 'end'
        },
        productTitle: {
            fontSize: '18px',
            lineHeight: '1.5rem',
            fontWeight: 'bold',
            color: fr.colors.decisions.text.title.blueFrance.default,
            '&:hover': {
                textDecoration: 'underline'
            }
        },
    });

export { getServerSideProps };
