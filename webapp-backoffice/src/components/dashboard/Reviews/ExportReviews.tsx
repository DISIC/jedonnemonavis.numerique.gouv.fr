import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import React from 'react';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import { ReviewFiltersType } from '@/src/types/custom';
import { Download } from '@codegouvfr/react-dsfr/Download';
import { generateRandomString } from '@/src/utils/tools';
import ExportModal from './ExportModal';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Tooltip } from '@mui/material';

interface Props {
	product_id: number;
	startDate: string;
	endDate: string;
	mustHaveVerbatims: boolean;
	search: string;
	button_id: number | undefined;
	filters: ReviewFiltersType;
	reviewsCountfiltered: number;
	reviewsCountAll: number;
}

const ExportReviews = (props: Props) => {
	const {
		product_id,
		startDate,
		endDate,
		mustHaveVerbatims,
		search,
		button_id,
		filters,
		reviewsCountfiltered,
		reviewsCountAll
	} = props;
	const { cx, classes } = useStyles();
	const [exportStatus, setExportStatus] = React.useState<
		'idle' | 'inProgress' | 'completed'
	>('idle');
	const [intervalId, setIntervalId] = React.useState<NodeJS.Timeout | null>(
		null
	);
	const [memoryKey, setMemoryKey] = React.useState<string>(
		generateRandomString(10)
	);
	const [progress, setProgress] = React.useState<number>(0);

	const export_modal = createModal({
		id: 'export-modal',
		isOpenedByDefault: false
	});

	const exportData = trpc.review.exportData.useMutation({
		onSuccess: () => {
			setExportStatus('completed');
		}
	});

	const getProgress = async () => {
		const data = await fetch(`/api/memory?memoryKey=${memoryKey}`, {
			method: 'GET'
		}).then(async r => {
			if (!r.ok) {
				throw Error(`got status ${r.status}`);
			}
			return r.json();
		});
		if (data.progress) setProgress(data.progress);
	};

	React.useEffect(() => {
		if (exportStatus === 'inProgress') {
			const id = setInterval(() => {
				getProgress();
			}, 1000);
			setIntervalId(id);
			return () => {
				clearInterval(id);
			};
		} else if (exportStatus === 'completed') {
			if (intervalId) {
				clearInterval(intervalId);
			}
		}
	}, [exportStatus]);

	const applyChoice = (choice: 'all' | 'filtered') => {
		export_modal.close();
		/*setExportStatus('inProgress');
		exportData.mutate(
			choice === 'all'
				? { memoryKey }
				: {
						product_id,
						start_date: startDate,
						end_date: endDate,
						shouldIncludeAnswers: true,
						mustHaveVerbatims,
						search,
						button_id,
						filters,
						memoryKey
					}
		);*/
	};

	return (
		<>
			<ExportModal
				modal={export_modal}
				counts={{
					countFiltered: reviewsCountfiltered,
					countAll: reviewsCountAll
				}}
				product_id={product_id}
				params={JSON.stringify({
					startDate,
					endDate,
					mustHaveVerbatims,
					search,
					button_id,
					filters
				})}
				action={applyChoice}
			></ExportModal>

			{exportStatus === 'idle' && (
				<Tooltip
					placement="top"
					title="🚧 Fonctionnalité en cours de déploiement, accessible dès la semaine prochaine."
				>
					<Button
						priority="tertiary"
						iconId="fr-icon-file-download-line"
						iconPosition="right"
						type="button"
						// nativeButtonProps={export_modal.buttonProps}
					>
						Télécharger
					</Button>
				</Tooltip>
			)}
			{exportStatus === 'inProgress' && (
				<div>
					<div>
						<p className={cx(classes.loading)}>
							Export en cours : {Math.round(progress * 100) / 100}%
						</p>
					</div>
					<div>
						<div className={cx(classes.progressBarWrapper)}>
							<div
								style={{ width: `${progress}%` }}
								className={cx(classes.progressBar)}
							>
								{' '}
							</div>
						</div>
					</div>
				</div>
			)}
			{exportStatus === 'completed' && (
				<>
					<div className={cx(classes.download)}>
						<Download
							details="Le fichier CSV est prêt."
							label="Télécharger le fichier"
							linkProps={{
								href: `/api/export?fileName=${exportData.data?.fileName}`,
								target: '_blank'
							}}
							style={{ marginBottom: '0' }}
						/>
					</div>
				</>
			)}
		</>
	);
};

const useStyles = tss.withName(ExportReviews.name).create(() => ({
	progressBarWrapper: {
		width: '100%',
		minWidth: '150px',
		backgroundColor: fr.colors.decisions.border.default.grey.default
	},
	progressBar: {
		height: '12px',
		backgroundColor: fr.colors.decisions.text.default.info.default,
		textAlign: 'center',
		color: 'white'
	},
	loading: {
		marginBottom: '0',
		textDecoration: 'italic',
		display: 'flex',
		alignItems: 'center',
		fontSize: '0.75rem'
	},
	download: {
		display: 'flex',
		alignItems: 'center'
	}
}));

export default ExportReviews;
