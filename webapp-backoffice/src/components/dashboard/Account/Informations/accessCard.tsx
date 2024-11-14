import { fr } from '@codegouvfr/react-dsfr';
import React, { ReactElement } from 'react';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Props {
	title: string;
	date?: string;
	modifiable: Boolean;
	link?: string;
	action?: (message: string) => Promise<void>;
}

const AccessCard = (props: Props) => {
	const { title, date, modifiable, link, action } = props;
	const { cx, classes } = useStyles();
	const router = useRouter();

	return (
		<>
			<div className={cx(fr.cx('fr-card', 'fr-p-2w', 'fr-mb-4v'))}>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
					)}
				>
					<div className={cx(fr.cx('fr-col-12', 'fr-col-md-6'))}>
						{link ? (
							<Link className={cx(fr.cx('fr-mb-0'))} href={link}>
								<p
									className={cx(
										fr.cx('fr-mb-0', 'fr-text--bold'),
										classes.productName
									)}
								>
									{title}
								</p>
							</Link>
						) : (
							<p className={cx(fr.cx('fr-text--bold', 'fr-mb-0'))}>{title}</p>
						)}
					</div>
					<div className={cx(fr.cx('fr-col-12', 'fr-col-md-3'))}>
						<p className={cx(fr.cx('fr-mb-0'))}>depuis: {date}</p>
					</div>
					{modifiable && action && (
						<div
							className={cx(
								fr.cx('fr-col-12', 'fr-col-md-3'),
								classes.actionContainer
							)}
						>
							<Button
								priority="secondary"
								type="button"
								onClick={() => {
									action(
										`L'accès ${link ? 'au service' : "à l'organisation"} ${title} a bien été retiré.`
									);
								}}
								nativeButtonProps={{
									'aria-label': `Retirer l'accès ${link ? 'au service' : "à l'organisation"} ${title}`,
									title: `Retirer l'accès ${link ? 'au service' : "à l'organisation"} ${title}`
								}}
							>
								Retirer l'accès
							</Button>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName(AccessCard.name).create(() => ({
	actionContainer: {
		display: 'flex',
		justifyContent: 'flex-end'
	},
	productName: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
	}
}));

export default AccessCard;
