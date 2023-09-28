import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Button as PrismaButtonType } from '@prisma/client';

interface Props {
	button: PrismaButtonType;
}

const ProductButtonCard = (props: Props) => {
	const { button } = props;

	return (
		<div className={fr.cx('fr-card', 'fr-my-3v', 'fr-p-2w')}>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-5')}>
					<p>{button.title}</p>
					<p>{button.description}</p>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-3')}>
					<p>{button.created_at.toLocaleString()}</p>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-4')}>
					<Button priority="secondary">Options</Button>
					<Button>Installer</Button>
				</div>
			</div>
		</div>
	);
};

export default ProductButtonCard;
