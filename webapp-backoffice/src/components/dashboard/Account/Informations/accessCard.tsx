import { ModalAccessKind } from '@/src/pages/administration/dashboard/user/[id]/access';
import { fr } from '@codegouvfr/react-dsfr';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { Menu, MenuItem } from '@mui/material';
import { RightAccessStatus } from '@prisma/client';
import { push } from '@socialgouv/matomo-next';
import Link from 'next/link';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	id?: number;
	title: string;
	date?: string;
	modifiable: Boolean;
	link?: string;
	right?: RightAccessStatus;
	action?: (message: string) => Promise<void>;
	handleAction?: (kind: ModalAccessKind, id: number) => Promise<void>;
}

const AccessCard = (props: Props) => {
	const { id, title, date, modifiable, link, right, action, handleAction } =
		props;
	const { cx, classes } = useStyles();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
		push(['trackEvent', 'BO - Product', `Open-Menu`]);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

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
					<div className={cx(fr.cx('fr-col-12', 'fr-col-md-5'))}>
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
								fr.cx('fr-col-12', 'fr-col-md-4'),
								classes.actionContainer
							)}
						>
							{link ? (
								<>
									<div className={cx(classes.badgeContainer)}>
										<Badge
											noIcon
											small
											severity={right === 'carrier_admin' ? 'info' : undefined}
											className={fr.cx('fr-mr-4v')}
										>
											{right === 'carrier_admin'
												? 'Administrateur'
												: 'Utilisateur'}
										</Badge>
									</div>

									<Button
										id="button-options"
										aria-controls={menuOpen ? 'option-menu' : undefined}
										aria-haspopup="true"
										aria-expanded={menuOpen ? 'true' : undefined}
										priority="secondary"
										size="small"
										onClick={handleClick}
										iconId={
											menuOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
										}
										iconPosition="right"
										nativeButtonProps={{
											'aria-label': `Accéder aux options de droits sur le service "${title}"`,
											title: `Accéder aux options de droits sur le service "${title}"`
										}}
										className={classes.button}
									>
										Options
									</Button>
									<Menu
										id="option-menu"
										open={menuOpen}
										anchorEl={anchorEl}
										onClose={handleClose}
										MenuListProps={{
											'aria-labelledby': 'button-options'
										}}
									>
										<MenuItem
											onClick={() => {
												if (id && handleAction) {
													handleAction('removeAccessRight', id);
													handleClose();
												}
											}}
										>
											Retirer l'accès
										</MenuItem>
										<MenuItem
											onClick={() => {
												if (id && handleAction) {
													handleAction(
														right === 'carrier_admin'
															? 'switchAccessRightUser'
															: 'switchAccessRightAdmin',
														id
													);
													handleClose();
												}
											}}
										>
											Passer en{' '}
											{right === 'carrier_admin'
												? 'utilisateur'
												: 'administrateur'}{' '}
											du service
										</MenuItem>
									</Menu>
								</>
							) : (
								<>
									{' '}
									<Button
										priority="secondary"
										type="button"
										size="small"
										onClick={() => {
											if (id && handleAction) {
												handleAction('removeEntityright', id);
												handleClose();
											}
										}}
										nativeButtonProps={{
											'aria-label': `Retirer l'accès ${
												link ? 'au service' : "à l'organisation"
											} ${title}`,
											title: `Retirer l'accès ${
												link ? 'au service' : "à l'organisation"
											} ${title}`
										}}
										className={classes.button}
									>
										Retirer l'accès
									</Button>
								</>
							)}
							{/* <Button
								priority="secondary"
								type="button"
								onClick={() => {
									action(
										`L'accès ${link ? 'au service' : "à l'organisation"} ${title} a bien été retiré.`
									);
									push([
										'trackEvent',
										'BO - Users',
										`Access-${link ? 'Service' : 'Entity'}-Remove`
									]);
								}}
								nativeButtonProps={{
									'aria-label': `Retirer l'accès ${link ? 'au service' : "à l'organisation"} ${title}`,
									title: `Retirer l'accès ${link ? 'au service' : "à l'organisation"} ${title}`
								}}
							>
								Retirer l'accès
							</Button> */}
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
		justifyContent: 'flex-end',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			justifyContent: 'flex-start',
			gap: fr.spacing('4v')
		}
	},
	button: {
		[fr.breakpoints.down('md')]: {
			width: '100%',
			justifyContent: 'center'
		}
	},
	badgeContainer: {
		display: 'flex',
		alignItems: 'center'
	},
	productName: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
	}
}));

export default AccessCard;
