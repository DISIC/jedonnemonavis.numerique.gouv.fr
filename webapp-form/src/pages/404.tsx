import { fr } from '@codegouvfr/react-dsfr';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { tss } from 'tss-react/dsfr';

export default function JDMA404() {
	const { classes, cx } = useStyles();
	const { t } = useTranslation('common');

	return (
		<div className={cx(fr.cx('fr-container'), classes.root)}>
			<div className={classes.content}>
				<h1 className={fr.cx('fr-mb-6v')}>{t('pages.not_found.h1')}</h1>
				<p className={cx(fr.cx('fr-text--sm', 'fr-mb-6v'), classes.mention)}>
					{t('pages.not_found.error_code')}
				</p>
				<p className={fr.cx('fr-text--lead', 'fr-mb-6v')}>
					{t('pages.not_found.text')}
				</p>
				<p className={fr.cx('fr-text--sm', 'fr-mb-1v')}>
					{t('pages.not_found.share_text')}
				</p>
				<a
					className={fr.cx(
						'fr-link',
						'fr-link--sm',
						'fr-link--icon-right',
						'fr-icon-external-link-line'
					)}
					href="https://www.plus.transformation.gouv.fr/experience/step_1"
					target="_blank"
					rel="noopener noreferrer"
				>
					{t('pages.not_found.share_link')}
				</a>
			</div>
			<Image
				src="/Demarches/assets/technical-error_picto_illu.svg"
				alt=""
				width={282}
				height={319}
				className={classes.illustration}
			/>
		</div>
	);
}

const useStyles = tss.withName({ JDMA404 }).create({
	root: {
		maxWidth: 996,
		minHeight: '60vh',
		display: 'flex',
		alignItems: 'center',
		gap: fr.spacing('16v'),
		marginTop: fr.spacing('16v'),
		marginBottom: fr.spacing('20v'),
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column-reverse',
			gap: fr.spacing('8v')
		}
	},
	content: {
		flex: '1 0 0',
		minWidth: 0
	},
	mention: {
		color: fr.colors.decisions.text.mention.grey.default
	},
	illustration: {
		flexShrink: 0,
		[fr.breakpoints.down('md')]: {
			maxHeight: 200,
			width: 'auto'
		}
	}
});

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'fr', ['common']))
	}
});
