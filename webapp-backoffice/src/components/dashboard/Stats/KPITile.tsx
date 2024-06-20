import React, { type ReactNode, type CSSProperties } from 'react';
import { symToStr } from 'tsafe/symToStr';
import { fr } from '@codegouvfr/react-dsfr';
import { getLink } from '@codegouvfr/react-dsfr/link';
import { tss } from 'tss-react/dsfr';
import { Skeleton } from '@mui/material';
import { formatNumberWithSpaces } from '@/src/utils/tools';

export type KPITileProps = {
	id?: string;
	className?: string;
	title: string;
	kpi: number;
	desc?: ReactNode;
	linkHref: string;
	hideLink?: boolean;
	grey?: boolean;
	isLoading?: boolean;

	/** Default false */
	horizontal?: boolean;
	style?: CSSProperties;
};

export namespace KPITileProps {}

export const KPITile = (props: KPITileProps) => {
	const { title, kpi, desc, grey, hideLink, linkHref, isLoading } = props;

	const { cx, classes } = useStyles({
		grey: grey ?? false
	});

	const { Link } = getLink();

	return (
		<div className={cx(fr.cx('fr-tile'))}>
			<div className={cx(fr.cx('fr-tile__body'))}>
				<h3
					className={cx(
						fr.cx('fr-tile__title'),
						classes.titleText,
						!grey && classes.blueColor
					)}
				>
					{title}
				</h3>
				<p className={cx(classes.kpiText)}>
					{isLoading ? (
						<Skeleton variant="text" width="20%" height="2rem" />
					) : (
						formatNumberWithSpaces(kpi)
					)}
				</p>
				<p
					className={cx(
						fr.cx('fr-tile__desc', 'fr-text--sm'),
						classes.description
					)}
				>
					{desc}
				</p>
				{!hideLink && (
					<Link
						href={linkHref}
						className={cx(
							fr.cx('fr-text--sm'),
							classes.link,
							!grey && classes.blueColor
						)}
					>
						{isLoading ? (
							<Skeleton variant="text" width="50%" height="0.9rem" />
						) : (
							`Voir les ${title.toLowerCase()}`
						)}
						<i
							className={cx(fr.cx('fr-icon-arrow-right-line', 'fr-icon--sm'))}
						></i>
					</Link>
				)}
			</div>
		</div>
	);
};

const useStyles = tss
	.withName(KPITile.name)
	.withParams<{ grey: boolean }>()
	.create(({ grey }) => ({
		titleText: {
			fontSize: '1rem',
			marginBottom: '1rem',
			'::before': !grey
				? {
						backgroundImage:
							'linear-gradient(0deg, var(--border-active-blue-france), var(--border-active-blue-france))'
					}
				: undefined
		},
		kpiText: {
			display: 'flex',
			justifyContent: 'center',
			fontSize: '2rem',
			fontWeight: 'bold',
			marginBottom: '1rem'
		},
		blueColor: {
			color: fr.colors.decisions.background.flat.blueFrance.default
		},
		description: {
			minHeight: '40px',
			paddingBottom: '1rem!important'
		},
		link: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			backgroundImage: 'none',
			gap: '0.5rem'
		},
		icon: {
			height: '1rem',
			width: '1rem'
		}
	}));

KPITile.displayName = symToStr({ KPITile });

export default KPITile;
