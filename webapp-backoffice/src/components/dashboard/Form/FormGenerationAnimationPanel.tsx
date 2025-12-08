import { fr } from '@codegouvfr/react-dsfr';
import { LinearProgress } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { tss } from 'tss-react/dsfr';
import { useProgress } from '../../../hooks/useProgress';
import { computeItemFraction } from '@/src/utils/tools';

interface Props {
	title: string;
	onFinish?: () => void;
}

const FormGenerationAnimationPanel = ({ title, onFinish }: Props) => {
	const { cx, classes } = useStyles();

	const progress = useProgress({
		duration: 2000
	});

	useEffect(() => {
		if (progress >= 100 && typeof onFinish === 'function') {
			onFinish();
		}
	}, [progress]);

	const infos = [
		{
			id: 'mask-steps',
			iconClass: cx(classes.iconContainer, classes.blueIcon),
			text: (
				<>
					Vous pouvez <strong>masquer certaines étapes</strong> ou options de
					réponse
				</>
			)
		},
		{
			id: 'edit-intro',
			iconClass: cx(classes.iconContainer, classes.blueIcon),
			text: (
				<>
					Vous pouvez <strong>éditer le texte d'introduction</strong>
				</>
			)
		},
		{
			id: 'no-modify-questions',
			iconClass: cx(classes.iconContainer, classes.redIcon),
			text: (
				<>
					Vous ne pouvez pas&nbsp;
					<strong>modifier les questions existantes</strong> ou ajouter une
					nouvelle question
				</>
			)
		}
	];

	return (
		<>
			<div className={cx(classes.titleContainer)}>
				<Image
					src={`/assets/system_picto.svg`}
					alt="Generation"
					width={120}
					height={120}
				/>
				<h1 className={fr.cx('fr-h3', 'fr-mb-1v')}>
					Génération du formulaire <i>{title}</i>
				</h1>
			</div>
			<LinearProgress
				variant="determinate"
				className={fr.cx('fr-my-8v', 'fr-p-1v')}
				value={progress}
			/>
			<div
				className={cx(
					classes.infoContainer,
					classes.withBackground,
					fr.cx('fr-my-8v', 'fr-p-6v')
				)}
				style={{ justifyContent: 'start' }}
			>
				<div className={classes.iconContainer}>
					<i className={cx(fr.cx('ri-question-line', 'fr-icon--lg'))} />
				</div>
				<p className={fr.cx('fr-mb-0', 'fr-ml-6v', 'fr-col--middle')}>
					<strong>Le formulaire est générique</strong> afin de garantir une
					évaluation homogène entre les services numériques.
				</p>
			</div>
			<div className={cx(classes.infosContainer)}>
				{infos.map((info, idx) => {
					const t = computeItemFraction(progress, idx, infos.length);
					const opacity = t;
					const translateY = (1 - t) * 8;
					return (
						<div
							key={info.id}
							className={cx(classes.infoContainer)}
							style={{
								justifyContent: 'start',
								opacity,
								transform: `translateY(${translateY}px)`,
								transition: 'opacity 120ms linear, transform 120ms linear'
							}}
							aria-hidden={t <= 0}
						>
							<div className={info.iconClass}>
								<i
									className={cx(
										fr.cx(
											idx === 2 ? 'ri-close-line' : 'ri-check-fill',
											'fr-icon--lg'
										)
									)}
								/>
							</div>
							<p className={fr.cx('fr-mb-0', 'fr-ml-6v', 'fr-col--middle')}>
								{info.text}
							</p>
						</div>
					);
				})}
			</div>
		</>
	);
};

export default FormGenerationAnimationPanel;

const useStyles = tss.create(() => ({
	titleContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		width: '100%',
		textAlign: 'center'
	},
	infosContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('8v'),
		width: '100%'
	},
	infoContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%'
	},
	withBackground: {
		backgroundColor: fr.colors.options.blueEcume._950_100.default
	},
	iconContainer: {
		width: fr.spacing('12v'),
		height: fr.spacing('12v'),
		backgroundColor: 'white',
		color: fr.colors.decisions.background.flat.blueFrance.default,
		borderRadius: '50%',
		flexShrink: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	blueIcon: {
		color: fr.colors.decisions.background.flat.blueFrance.default,
		backgroundColor: fr.colors.decisions.background.contrast.info.default
	},
	redIcon: {
		color: fr.colors.decisions.text.default.error.default,
		backgroundColor: fr.colors.decisions.background.contrast.error.default
	}
}));
