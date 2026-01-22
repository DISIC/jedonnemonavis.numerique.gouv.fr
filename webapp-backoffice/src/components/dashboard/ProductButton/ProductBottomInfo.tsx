import { fr } from '@codegouvfr/react-dsfr';
import Image from 'next/image';
import { ReactNode } from 'react';
import { tss } from 'tss-react';
import Link from 'next/link';

type ProductBottomInfoProps = {
	background: string;
	title: string;
	hasBorder: boolean;
	contents: {
		text: string;
		link: string;
		image: string;
	}[];
};

const ProductBottomInfo = ({
	background,
	title,
	hasBorder,
	contents
}: ProductBottomInfoProps) => {
	const useStyles = tss.create({
		container: {
			border: hasBorder
				? `1px solid ${fr.colors.decisions.border.default.grey.default}`
				: 'none',
			padding: '64px',
			backgroundColor: background
		},
		title: {
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	});

	const { cx, classes } = useStyles();

	return (
		<div className={classes.container}>
			<h3 className={classes.title}>{title}</h3>

			{contents.map((content, index) => {
				return (
					<div
						key={index}
						className={fr.cx(
							'fr-grid-row',
							'fr-grid-row--left',
							'fr-grid-row--middle',
							'fr-pb-3v'
						)}
					>
						<div
							className={fr.cx(
								'fr-col-12',
								'fr-col-md-3',
								'fr-mb-3v',
								'fr-mb-md-0'
							)}
						>
							<Image
								src={content.image}
								alt={content.text}
								width={120}
								height={120}
							/>
						</div>
						<div className={fr.cx('fr-col-12', 'fr-col-md-9')}>
							<p className={fr.cx('fr-mb-0')}>{content.text}</p>
							<Link
								className={fr.cx('fr-link')}
								href={content.link}
								target="_blank"
								rel="noopener noreferrer"
							>
								{content.link}
							</Link>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default ProductBottomInfo;
