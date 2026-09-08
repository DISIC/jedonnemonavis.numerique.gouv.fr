import PublicStats, {
	PublicStatsForm
} from '@/src/components/dashboard/Stats/PublicStats';
import prisma from '@/src/utils/db';
import { isValidDate } from '@/src/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

interface Props {
	form: (PublicStatsForm & { product: { id: number; title: string } }) | null;
	defaultStartDate: string;
	defaultEndDate: string;
}

const FormStatPage = ({ form, defaultStartDate, defaultEndDate }: Props) => {
	if (form === null) {
		return (
			<div className={fr.cx('fr-container')}>
				<h1 className={fr.cx('fr-mt-20v')}>Statistiques</h1>
				<div role="alert">
					<Alert
						severity="info"
						title="Ce formulaire n'existe pas ou ses statistiques ne sont pas publiques"
						description="Veuillez vérifier l'identifiant du formulaire ou contacter le porteur."
						className={fr.cx('fr-mt-20v', 'fr-mb-20v')}
					/>
				</div>
			</div>
		);
	}

	const formTitle = form.title || form.form_template.title;

	return (
		<div className={fr.cx('fr-container', 'fr-mb-10w')}>
			<Head>
				<title>{`${form.product.title} | ${formTitle} | Statistiques | Je donne mon avis`}</title>
				<meta
					name="description"
					content={`${form.product.title} | ${formTitle} | Statistiques | Je donne mon avis`}
				/>
			</Head>
			<PublicStats
				product={form.product}
				forms={[form]}
				subtitle={formTitle}
				defaultStartDate={defaultStartDate}
				defaultEndDate={defaultEndDate}
			/>
		</div>
	);
};

const firstQueryValue = (value: string | string[] | undefined) =>
	Array.isArray(value) ? value[0] : value;

export const getServerSideProps: GetServerSideProps = async context => {
	const formId = Number(firstQueryValue(context.query.form_id));
	const startDate = firstQueryValue(context.query['date-debut']);
	const endDate = firstQueryValue(context.query['date-fin']);

	if (!Number.isInteger(formId)) {
		return { props: { form: null } };
	}

	const form = await prisma.form.findUnique({
		where: { id: formId },
		include: {
			product: { select: { id: true, title: true, status: true } },
			form_template: true,
			form_configs: {
				where: { status: 'published' },
				include: {
					form_config_displays: true,
					form_config_labels: true
				},
				orderBy: { created_at: 'desc' }
			},
			buttons: { include: { closedButtonLog: true } }
		}
	});


	if (!form || !form.isPublic || form.product.status === 'archived') {
		return { props: { form: null } };
	}

	return {
		props: {
			form: JSON.parse(JSON.stringify(form)),
			defaultStartDate:
				startDate && isValidDate(startDate)
					? startDate
					: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
							.toISOString()
							.split('T')[0],
			defaultEndDate:
				endDate && isValidDate(endDate)
					? endDate
					: new Date().toISOString().split('T')[0]
		}
	};
};

export default FormStatPage;
