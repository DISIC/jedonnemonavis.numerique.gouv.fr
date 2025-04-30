import { FormWithElements } from '@/src/types/prismaTypesExtended';
import { fr } from '@codegouvfr/react-dsfr';
import { useState } from 'react';
import { tss } from 'tss-react';

interface Props {
	block: FormWithElements['form_template']['form_template_steps'][0]['form_template_blocks'][0];
	disabled: boolean;
	nbItems?: number;
}

const Radios = (props: Props) => {
	const { block, disabled, nbItems } = props;
	const { classes, cx } = useStyles({ nbItems: nbItems });

	const [selectedValue, setSelectedValue] = useState<string | null>(null);

	return (
		<div className={classes.container}>
			<fieldset>
				<ul>
					{block.options.map(opt => (
						<li key={opt.id}>
							<input
								className={fr.cx('fr-sr-only')}
								id={`radio-${block.id}-${opt.id}`}
								type="radio"
								name={`radio-${block.id}`}
								value={opt.value || ''}
								checked={selectedValue === opt.value}
								onClick={() => {
									setSelectedValue((prev) => prev === opt.value ? null : opt.value);
								}}
								disabled={disabled}
							/>
							<label htmlFor={`radio-${block.id}-${opt.id}`}>{opt.label}</label>
						</li>
					))}
				</ul>
			</fieldset>
		</div>
	);
};

const useStyles = tss
	.withName(Radios.name)
	.withParams<{ nbItems?: number }>()
	.create(({ nbItems }) => ({
		container: {
			display: "flex",
			alignItems: "center",
			marginTop: fr.spacing("4v"),
			fieldset: {
				border: 0,
				padding: 0,
				margin: 0,
				width: "100%",
				ul: {
					padding: 0,
					margin: 0,
					listStyle: 'none',
					width: "100%",
					li: {
						paddingBottom: 0,
						marginBottom: fr.spacing("3v"),
						':last-child': {
							marginBottom: 0,
						},
						label: {
							display: 'flex',
							justifyContent: 'center',
							textAlign: 'center',
							border: `1px solid ${fr.colors.decisions.background.alt.grey.hover}`,
							fontWeight: 500,
							width: '100%',
							padding: fr.spacing('3v'),
							color: fr.colors.decisions.text.label.blueFrance.default,
							img: {
								marginRight: fr.spacing("2v"),
							},
							["&:hover"]: {
								borderColor: fr.colors.decisions.background.alt.grey.active,
							},
							[fr.breakpoints.up("md")]: {
								marginBottom: 0,
								flexDirection: "column",
								...fr.spacing("padding", {topBottom: "2v", rightLeft: "4v"}),
								img: {
									marginTop: fr.spacing("2v"),
									marginRight: 0,
								},
							},
						}
					},
				},
				[fr.breakpoints.up("md")]: {
					width: "initial",
					ul: {
						width: "initial",
						columns: nbItems,
					},
				},
			},
			["input:checked + label"]: {
				borderColor: fr.colors.decisions.background.flat.blueFrance.default,
				backgroundColor: fr.colors.decisions.background.flat.blueFrance.default,
				color: 'white',
			},
			["input:focus-visible + label"]: {
				outlineOffset: "2px",
				outline: "2px solid #4D90FE",
			},
			[fr.breakpoints.down("md")]: {
				flexDirection: "column",
			},
		},
	}
));

export default Radios;
