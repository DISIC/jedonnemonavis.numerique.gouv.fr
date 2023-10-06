import { formatDateToFrenchString } from '@/utils/tools';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Button as PrismaButtonType } from '@prisma/client';
import React from 'react';
import { Menu, MenuItem } from '@mui/material';

interface Props {
	button: PrismaButtonType;
	onButtonClick: (modalType: string, button?: PrismaButtonType) => void;
}

const ProductButtonCard = (props: Props) => {
	const { button, onButtonClick } = props;
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const menuOpen = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<div className={fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w')}>
				<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
						<p className={fr.cx('fr-mb-0')}>{button.title}</p>
						<p className={fr.cx('fr-mb-0')}>{button.description}</p>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
						<p>{formatDateToFrenchString(button.created_at.toString())}</p>
					</div>
					<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
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
							<MenuItem
								onClick={() => {
									onButtonClick('edit', button), handleClose();
								}}
							>
								Modifier le bouton
							</MenuItem>
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
						<Button
							className={fr.cx('fr-ml-3w')}
							onClick={() => onButtonClick('install')}
						>
							Installer
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProductButtonCard;
