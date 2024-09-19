import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Form } from '@/prisma/generated/zod';
import FormLayout from '@/src/layouts/Form/FormLayout';
import Tag from '@codegouvfr/react-dsfr/Tag';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { trpc } from '@/src/utils/trpc';

interface Props {
	form: Form;
}

const FormBuilder: React.FC<Props> = props => {
	const { form } = props;

	const { classes } = useStyles();

	const handleSaveForm = async (tmpForm: Form) => {
		try {
			const { id, active } = tmpForm;
			const formSaved = await saveForm.mutateAsync({
				id,
				active: !form.active
			});
		} catch (e) {
			console.error(e);
		}
	};

	const saveForm = trpc.form.update.useMutation({
		onSuccess: () => {}
	});

	return (
		<FormLayout form={form}>
			<Head>
				<title>{form.title} | Form Informations | Je donne mon avis</title>
				<meta
					name="description"
					content={`${form.title} | Form Informations | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h1>Informations</h1>
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Nom du formulaire</h4>
					<Tag id="product-id" small>
						{`# ${form.title}`}
					</Tag>
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>URL Formulaire</h4>
					<div className={classes.urlsWrapper}>
						<Tag
							linkProps={{
								href: `${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/custom/${form.id}`
							}}
						>
							{`${process.env.NEXT_PUBLIC_FORM_APP_URL}/Demarches/custom/${form.id}`}
						</Tag>
					</div>
				</div>
				<div>
					<h4 className={fr.cx('fr-mb-3v')}>Activation</h4>
					<ToggleSwitch
						inputTitle="form-active"
						label="Activer le formulaire"
						labelPosition="right"
						showCheckedHint
						defaultChecked={form.active}
						onChange={async () => {
							handleSaveForm(form);
						}}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

const useStyles = tss.withName(FormBuilder.name).create({
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('10v')
	},
	droppableArea: {
		padding: '8px',
		backgroundColor: '#f4f4f4',
		minHeight: '200px'
	},
	urlsWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: fr.spacing('4v')
	}
});

export default FormBuilder;

export { getServerSideProps };
