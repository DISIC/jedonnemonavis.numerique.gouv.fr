import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import React from 'react';
import { Menu } from '@mui/material';
import { UserProductUserWithUsers } from '@/pages/api/prisma/userProduct/type';
import { tss } from 'tss-react/dsfr';

interface Props {
	userProduct: UserProductUserWithUsers;
	// onButtonClick: (modalType: string, button?: PrismaButtonType) => void;
}

const ProductAccessCard = (props: Props) => {
	const { userProduct } = props;
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
			<div
				className={cx(
					fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w'),
					userProduct.status === 'removed' ? classes.cardStatusRemoved : ''
				)}
			>
				<div
					className={fr.cx(
						'fr-grid-row',
						'fr-grid-row--gutters',
						'fr-grid-row--middle'
					)}
				>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
						<span
							className={fr.cx('fr-text--bold')}
						>{`${userProduct.user?.firstName} ${userProduct.user?.lastName}`}</span>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<span>{userProduct.user_email}</span>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						<Badge
							noIcon
							severity={userProduct.status === 'carrier' ? 'success' : 'error'}
							className={cx(
								classes.badge,
								userProduct.status === 'removed'
									? classes.badgeStatusRemoved
									: ''
							)}
						>
							{userProduct.status === 'carrier' ? 'Porteur' : 'Retiré'}
						</Badge>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-2')}>
						<Button
							id="button-options"
							aria-controls={menuOpen ? 'option-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={menuOpen ? 'true' : undefined}
							priority="secondary"
							onClick={handleClick}
							iconId={menuOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
							iconPosition="right"
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
							{/* <MenuItem onClick={() => onButtonClick('edit', button)}>
								Modifier le bouton
							</MenuItem> */}
							{/* <MenuItem onClick={() => onButtonClick('merge')}>
								Fusionner avec un autre bouton
							</MenuItem>
							<MenuItem
								onClick={() => onButtonClick('archive', button)}
								style={{
									color: fr.colors.decisions.background.flat.error.default
								}}
							>
								Archiver bouton
							</MenuItem> */}
						</Menu>
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
	}
});

export default ProductAccessCard;
