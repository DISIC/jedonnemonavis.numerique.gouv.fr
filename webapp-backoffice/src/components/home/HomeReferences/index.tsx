import Image from 'next/image';
import { tss } from 'tss-react/dsfr';
import { fr } from '@codegouvfr/react-dsfr';
import { Quote } from '@codegouvfr/react-dsfr/Quote';

export interface Reference {
	image_path: string;
	author: string;
	job_title: string;
	description: string;
}

interface HomeReferencesProps {
	references: Reference[];
}

const HomeReferences = (props: HomeReferencesProps) => {
	const { cx, classes } = useStyles();

	return (
		<section className={cx(fr.cx('fr-container'), classes.root)}>
			<div className={cx(fr.cx('fr-grid-row', 'fr-grid-row--center'))}>
				<div className={cx(fr.cx('fr-col-12', 'fr-col-md-10'))}>
					<h2>Elles recommandent</h2>
					{props.references.map((reference, index) => (
						<div key={index}>
							<Quote
								author={reference.author}
								className=""
								imageUrl={reference.image_path}
								size="xlarge"
								source={
									<>
										<li>
											<cite>{reference.job_title}</cite>
										</li>
									</>
								}
								text={reference.description}
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

const useStyles = tss.withName(HomeReferences.name).create(() => ({
	root: {
		h2: {
			color: fr.colors.decisions.text.title.blueFrance.default
		}
	},
	imageContainer: {
		display: 'flex',
		justifyContent: 'center',
		borderRight: `1px solid ${fr.colors.decisions.background.disabled.grey.default}`,
		paddingRight: 0
	},
	image: {
		borderRadius: '50%'
	},
	icon: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default
	},
	textContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		height: '100%',
		...fr.spacing('padding', { left: '4v' })
	},
	underInfos: {
		marginBottom: 0
	},
	bold: {
		fontWeight: 'bold'
	},
	italic: {
		fontStyle: 'italic',
		color: fr.colors.decisions.text.mention.grey.default
	}
}));

export default HomeReferences;
