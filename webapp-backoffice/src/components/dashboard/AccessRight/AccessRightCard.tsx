import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import type { AccessRightWithUsers } from '@/src/types/prismaTypesExtended';
import { tss } from 'tss-react/dsfr';
import { useSession } from 'next-auth/react';
import { AccessRightModalType } from '@/src/pages/administration/dashboard/product/[id]/access';
import { push } from '@socialgouv/matomo-next';

interface Props {
	accessRight: AccessRightWithUsers;
	onButtonClick: (
		modalType: AccessRightModalType,
		accessRight?: AccessRightWithUsers
	) => void;
	ownRight: 'admin' | 'viewer';
}

const ProductAccessCard = (props: Props) => {
	const { accessRight, onButtonClick, ownRight } = props;
	const { data: session } = useSession({ required: true });
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
		push(['trackEvent', 'BO - Product', 'Access-rights-Options']);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const { cx, classes } = useStyles();

	return (
		<>
			<div
				className={cx(
					fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w'),
					accessRight.status === 'removed' ? classes.cardStatusRemoved : ''
				)}
			>
				<div className={cx(fr.cx('fr-grid-row', 'fr-grid-row--middle'))}>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
						<span className={fr.cx('fr-text--bold')}>
							{accessRight.user
								? `${accessRight.user?.firstName} ${accessRight.user?.lastName}`
								: '-'}
						</span>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<span className={cx(classes.userEmail)}>
							{accessRight?.user_email
								? accessRight?.user_email
								: accessRight?.user_email_invite}
						</span>
					</div>

					<div
						className={cx(
							fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4'),
							classes.optionsDropdown
						)}
					>
						<Button
							id="button-options-access-right"
							aria-controls={menuOpen ? 'option-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={menuOpen ? 'true' : undefined}
							priority="secondary"
							className={menuOpen ? classes.buttonOptionsOpen : ''}
							onClick={handleClick}
							disabled={accessRight.user_email === session?.user?.email}
							iconId={menuOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
							iconPosition="right"
							size="small"
						>
							Options
						</Button>
						<Menu
							id="option-menu"
							open={menuOpen}
							anchorEl={anchorEl}
							onClose={handleClose}
							MenuListProps={{
								'aria-labelledby': 'button-options-access-right'
							}}
						>
							{accessRight.status !== 'removed' &&
								accessRight.user !== null &&
								ownRight === 'admin' && (
									<MenuItem
										style={{ color: '#000091' }}
										id="button-remove-access-right"
										aria-haspopup="true"
										aria-expanded={menuOpen ? 'true' : undefined}
										onClick={() => {
											onButtonClick('remove', accessRight);
											push([
												'trackEvent',
												'BO - Product',
												'Access-rights-Remove'
											]);
										}}
										disabled={accessRight.user_email === session?.user?.email}
									>
										Retirer l'accès
									</MenuItem>
								)}
							{accessRight.status !== 'removed' &&
								accessRight.user !== null &&
								ownRight === 'admin' && (
									<MenuItem
										style={{ color: '#000091' }}
										id="button-remove-access-right"
										aria-haspopup="true"
										aria-expanded={menuOpen ? 'true' : undefined}
										onClick={() => {
											onButtonClick('switch', accessRight);
											push([
												'trackEvent',
												'BO - Product',
												'Access-rights-Switch'
											]);
										}}
										disabled={accessRight.user_email === session?.user?.email}
									>
										{accessRight.status === 'admin'
											? "Retirer l'accès administrateur"
											: 'Passer en administrateur du service'}
									</MenuItem>
								)}
						</Menu>
						{accessRight.user === null && ownRight === 'admin' && (
							<>
								<Button
									id="button-options-access-right"
									aria-controls={menuOpen ? 'option-menu' : undefined}
									aria-haspopup="true"
									aria-expanded={menuOpen ? 'true' : undefined}
									priority="tertiary"
									className={menuOpen ? classes.buttonOptionsOpen : ''}
									onClick={handleClick}
									disabled={accessRight.user_email === session?.user?.email}
									iconId={
										menuOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
									}
									iconPosition="right"
									size="small"
								>
									Options
								</Button>
								<Menu
									id="option-menu"
									open={menuOpen}
									anchorEl={anchorEl}
									onClose={handleClose}
									MenuListProps={{
										'aria-labelledby': 'button-options-access-right'
									}}
								>
									{accessRight.status === 'carrier' &&
										accessRight.user === null && (
											<MenuItem
												onClick={() => {
													onButtonClick('resend-email', accessRight);
													push([
														'trackEvent',
														'BO - Product - Access Rights',
														'Resend Mail'
													]);
													handleClose();
												}}
											>
												Renvoyer l'invitation
											</MenuItem>
										)}

									{accessRight.status === 'carrier' && (
										<MenuItem
											onClick={() => {
												onButtonClick('remove', accessRight);
												push([
													'trackEvent',
													'BO - Product - Access Rights',
													'Remove'
												]);
												handleClose();
											}}
										>
											Retirer l&apos;accès utilisateur
										</MenuItem>
									)}
									{accessRight.status === 'removed' && (
										<MenuItem
											onClick={() => {
												onButtonClick('reintegrate', accessRight);
												push([
													'trackEvent',
													'BO - Product - Access Rights',
													'Restore'
												]);
												handleClose();
											}}
										>
											Rétablir l&apos;accès utilisateur
										</MenuItem>
									)}
								</Menu>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.create({
	cardStatusRemoved: {
		backgroundColor: fr.colors.decisions.background.disabled.grey.default
	},
	badge: {
		display: 'block',
		width: '7.5rem',
		textAlign: 'center'
	},
	badgeStatusRemoved: {
		color: fr.colors.decisions.background.flat.purpleGlycine.default,
		backgroundColor:
			fr.colors.decisions.background.contrast.purpleGlycine.default
	},
	buttonOptionsOpen: {
		backgroundColor: fr.colors.decisions.background.actionLow.blueFrance.default
	},
	userEmail: {
		wordWrap: 'break-word',
		fontSize: '12px'
	},
	optionsDropdown: {
		display: 'flex',
		justifyContent: 'flex-end'
	}
});

export default ProductAccessCard;
