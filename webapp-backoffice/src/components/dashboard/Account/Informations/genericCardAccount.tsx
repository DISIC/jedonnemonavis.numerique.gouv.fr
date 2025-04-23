import { fr } from '@codegouvfr/react-dsfr';
import React, { ReactElement } from 'react';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRouter } from 'next/router';
import { push } from '@socialgouv/matomo-next';

interface Props {
	title: string;
	hint?: string;
	modifiable: Boolean;
	viewModeContent: ReactElement;
	editModeContent?: ReactElement;
	onSubmit?: () => Promise<boolean>;
	smallScreenShowHr?: boolean;
}

const GenericCardInfos = (props: Props) => {
	const {
		title,
		hint,
		modifiable,
		viewModeContent,
		editModeContent,
		onSubmit,
		smallScreenShowHr = true
	} = props;
	const [modifying, setModifying] = React.useState<Boolean>(false);
	const { cx, classes } = useStyles();
	const router = useRouter();

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
					<div className={cx(fr.cx('fr-col-12', 'fr-col-lg-6', 'fr-pt-5v'))}>
						<h4 className={cx(fr.cx('fr-mb-0'))}>{title}</h4>
						{hint && <p className={cx(fr.cx('fr-mb-0', 'fr-mt-4v'))}>{hint}</p>}
					</div>
					<div
						className={cx(
							fr.cx('fr-col-12', 'fr-col-lg-6', 'fr-pt-5v'),
							classes.actionContainer
						)}
					>
						{modifiable && !modifying && (
							<Button
								priority="secondary"
								iconId="fr-icon-edit-line"
								onClick={() => {
									setModifying(true);
									push(['trackEvent', 'BO - Account', `Modify-${title}`]);
								}}
								className={classes.button}
							>
								Modifier
							</Button>
						)}
						{modifiable && modifying && onSubmit && (
							<>
								<Button
									priority="secondary"
									onClick={() => {
										setModifying(false);
										push([
											'trackEvent',
											'BO - Account',
											`Cancel-Changes-${title}`
										]);
									}}
									className={cx(classes.button)}
								>
									Annuler
								</Button>
								<Button
									priority="primary"
									iconId="fr-icon-save-line"
									className={cx(fr.cx('fr-ml-md-4v'), classes.button)}
									onClick={async () => {
										const isFormValid = await onSubmit?.();
										push([
											'trackEvent',
											'BO - Account',
											`Validate-Changes-${title}`
										]);
										if (isFormValid) {
											setModifying(false);
										}
									}}
								>
									Sauvegarder
								</Button>
							</>
						)}
					</div>
					{smallScreenShowHr || modifying && (
						<div className={cx(fr.cx('fr-col-md-12', 'fr-pb-0'))}>
							<hr />
						</div>
					)}
					<div className={cx(fr.cx(smallScreenShowHr || modifying ? 'fr-col-md-12' : 'fr-col-12', 'fr-pb-6v'), (smallScreenShowHr || modifying ? classes.mobileFullWidth : '') )}>
						{modifying ? editModeContent : viewModeContent}
					</div>
				</div>
			</div>
		</>
	);
};

const useStyles = tss.withName(GenericCardInfos.name).create(() => ({
	actionContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
		[fr.breakpoints.down('md')]: {
			flexDirection: 'column',
			gap: fr.spacing('4v'),
			marginBottom: fr.spacing('2v'),
		}
	},
	mobileFullWidth: {
		[fr.breakpoints.down('md')]: {
			width: '100%'
		}
	},
	tag: {},
	button: {
		[fr.breakpoints.down('md')]: {
			width: '100%',
			justifyContent: 'center',
		}
	}
}));

export default GenericCardInfos;
