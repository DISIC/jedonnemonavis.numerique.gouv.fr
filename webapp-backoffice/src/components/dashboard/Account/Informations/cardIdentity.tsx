import { fr } from '@codegouvfr/react-dsfr';
import React, { ReactElement } from 'react';
import { tss } from 'tss-react/dsfr';
import { User } from '@/prisma/generated/zod';
import Button from '@codegouvfr/react-dsfr/Button';

interface Props {
	user: User;
	title: string;
	hint?: string;
	modifiable: Boolean;
	children: ReactElement;
}

const CardIdentity = (props: Props) => {
	const { user, title, hint, modifiable, children } = props;
	const [modifying, setModifying] = React.useState<Boolean>(false);
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
					<div className={cx(fr.cx('fr-col-md-8', 'fr-pt-5v'))}>
						<h4 className={cx(fr.cx('fr-mb-0'))}>{title}</h4>
						{hint && <p className={cx(fr.cx('fr-mb-0', 'fr-mt-4v'))}>{hint}</p>}
					</div>
					<div
						className={cx(
							fr.cx('fr-col-md-4', 'fr-pt-5v'),
							classes.actionContainer
						)}
					>
						{modifiable && !modifying && (
							<Button
								priority="secondary"
								iconId="fr-icon-settings-5-line"
								onClick={() => setModifying(true)}
							>
								Modifier
							</Button>
						)}
						{modifiable && modifying && (
							<>
								<Button
									priority="secondary"
									onClick={() => setModifying(false)}
								>
									Annuler
								</Button>
								<Button
									priority="primary"
									iconId="fr-icon-save-line"
									iconPosition="right"
									className={cx(fr.cx('fr-ml-4v'))}
									onClick={() => console.log('switch mode')}
								>
									Sauvegarder
								</Button>
							</>
						)}
					</div>
					<div className={cx(fr.cx('fr-col-md-12'))}>
						<hr />
					</div>
					<div className={cx(fr.cx('fr-col-md-12'))}>{children}</div>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName(CardIdentity.name).create(() => ({
	actionContainer: {
		display: 'flex',
		justifyContent: 'flex-end'
	},
	tag: {}
}));

export default CardIdentity;
