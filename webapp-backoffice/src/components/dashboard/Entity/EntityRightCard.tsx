import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import type { AdminEntityRightWithUsers } from '@/src/types/prismaTypesExtended';
import { tss } from 'tss-react/dsfr';
import { useSession } from 'next-auth/react';
import { AdminEntityRightModalType } from '@/src/pages/administration/dashboard/entities';

interface Props {
	adminEntityRight: AdminEntityRightWithUsers;
	onButtonClick: (
		modalType: AdminEntityRightModalType,
		adminEntityRight?: AdminEntityRightWithUsers
	) => void;
	isMine: boolean;
}

const EntityRightCard = (props: Props) => {
	const { adminEntityRight, onButtonClick, isMine } = props;
	const { data: session } = useSession({ required: true });
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const { cx, classes } = useStyles();

	return (
		<>
			<div className={cx(fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w'))}>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
					)}
				>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
						<span className={fr.cx('fr-text--bold')}>
							{adminEntityRight.user
								? `${adminEntityRight.user?.firstName} ${adminEntityRight.user?.lastName}`
								: '-'}
						</span>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<span className={cx(classes.userEmail)}>
							{adminEntityRight?.user_email
								? adminEntityRight?.user_email
								: adminEntityRight?.user_email_invite}
						</span>
					</div>
					<div
						className={fr.cx(
							'fr-col',
							'fr-col-12',
							isMine ? 'fr-col-md-2' : 'fr-col-md-2',
							isMine ? 'fr-col' : 'fr-col-offset-2'
						)}
					>
						<Badge
							noIcon
							severity={adminEntityRight.user !== null ? 'success' : 'info'}
							className={cx(classes.badge)}
						>
							{adminEntityRight.user === null ? 'Invité' : 'Admin'}
						</Badge>
					</div>
					{isMine && (
						<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
							<Button
								id="button-options-access-right"
								aria-controls={menuOpen ? 'option-menu' : undefined}
								aria-haspopup="true"
								aria-expanded={menuOpen ? 'true' : undefined}
								priority="tertiary"
								className={menuOpen ? classes.buttonOptionsOpen : ''}
								onClick={handleClick}
								disabled={adminEntityRight.user_email === session?.user?.email}
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
								{adminEntityRight.user === null && (
									<MenuItem
										onClick={() => {
											onButtonClick('resend-email', adminEntityRight);
											handleClose();
										}}
									>
										Renvoyer l'e-mail d'invitation
									</MenuItem>
								)}
								<MenuItem
									onClick={() => {
										onButtonClick('remove', adminEntityRight);
										handleClose();
									}}
								>
									Retirer comme administrateur de l'organisation
								</MenuItem>
							</Menu>
						</div>
					)}
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
		wordWrap: 'break-word'
	}
});

export default EntityRightCard;
