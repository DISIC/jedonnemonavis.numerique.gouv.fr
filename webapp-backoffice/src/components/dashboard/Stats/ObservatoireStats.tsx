import { fr } from '@codegouvfr/react-dsfr';

type ObservatoireStatsProps = {
	productId: number;
};

const ObservatoireStats = ({ productId }: ObservatoireStatsProps) => {
	return <div className={fr.cx('fr-card')}>Stats observatoire</div>;
};

export default ObservatoireStats;
