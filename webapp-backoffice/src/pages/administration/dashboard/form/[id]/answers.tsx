import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Form } from '@/prisma/generated/zod';
import FormLayout from '@/src/layouts/Form/FormLayout';

interface Props {
	form: Form;
}

const FormBuilder = (props: Props) => {
	const { form } = props;

	const router = useRouter();

	const { classes } = useStyles();

	return (
		<FormLayout form={form}>
			<Head>
				<title>{form.title} | Form Réponses | Je donne mon avis</title>
				<meta
					name="description"
					content={`${form.title} | Form Réponses | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h1>Form Réponses</h1>
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
	}
});

export default FormBuilder;

export { getServerSideProps };
