import { fr } from '@codegouvfr/react-dsfr';
import { User } from '@prisma/client';
import Link from 'next/link';

const ProductCard = ({ user }: { user: User }) => {
	return (
		<div className={fr.cx('fr-card', 'fr-my-3w', 'fr-p-2w')}>
			<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<p>{user.firstName + ' ' + user.lastName}</p>
				</div>
				<div className={fr.cx('fr-col', 'fr-col-12', 'fr-col-md-6')}>
					<p>{user.email}</p>
				</div>

				<div className={fr.cx('fr-col', 'fr-col-12')}>
					<div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}></div>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
