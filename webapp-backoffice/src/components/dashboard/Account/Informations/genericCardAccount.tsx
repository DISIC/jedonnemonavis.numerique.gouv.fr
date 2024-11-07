import { fr } from '@codegouvfr/react-dsfr';
import React, { ReactElement } from 'react';
import { tss } from 'tss-react/dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { useRouter } from 'next/router';

interface Props {
	title: string;
	hint?: string;
	modifiable: Boolean;
	viewModeContent: ReactElement;
	editModeContent?: ReactElement;
	onSubmit?: () => Promise<boolean>;
}

const GenericCardInfos = (props: Props) => {
	const {
		title,
		hint,
		modifiable,
		viewModeContent,
		editModeContent,
		onSubmit
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
								onClick={() => setModifying(true)}
							>
								Modifier
							</Button>
						)}
						{modifiable && modifying && onSubmit && (
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
									className={cx(fr.cx('fr-ml-4v'))}
									onClick={async () => {
										const isFormValid = await onSubmit?.();
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
					<div className={cx(fr.cx('fr-col-md-12', 'fr-pb-0'))}>
						<hr />
					</div>
					<div className={cx(fr.cx('fr-col-md-12', 'fr-pb-6v'))}>
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
		justifyContent: 'flex-end'
	},
	tag: {}
}));

export default GenericCardInfos;
