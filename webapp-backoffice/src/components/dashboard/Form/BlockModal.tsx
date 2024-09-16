import { Block, Form } from '@/prisma/generated/zod';
import { BlockValues } from '@/src/pages/administration/dashboard/form/[id]/builder';
import { CategorySchema, TypeBlocsInput } from '@/src/types/custom';
import { TypeBlocksDescription } from '@/src/utils/content';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { Typebloc } from '@prisma/client';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface CustomModalProps {
	buttonProps: {
		id: string;
		'aria-controls': string;
		'data-fr-opened': boolean;
	};
	Component: (props: ModalProps) => JSX.Element;
	close: () => void;
	open: () => void;
	isOpenedByDefault: boolean;
	id: string;
}

interface Props {
	modal: CustomModalProps;
	onSubmit: (block: BlockValues) => void;
	position: number;
	form: Form;
}

const BlockModal = (props: Props) => {
	const { modal, onSubmit, position, form } = props;
	const { cx, classes } = useStyles();
	const [selectedBloc, setSlectedBloc] = React.useState<TypeBlocsInput>(
		TypeBlocksDescription[0]
	);

	const handleOnSubmit = () => {
		console.log('test add ', selectedBloc.type, 'at position ', position);
		onSubmit({
			type_bloc: selectedBloc.type,
			form_id: form.id,
			created_at: new Date(),
			updated_at: new Date(),
			position: position + 1
		});
		modal.close();
	};

	return (
		<modal.Component
			className={cx(
				fr.cx(
					'fr-grid-row',
					'fr-grid-row--center',
					'fr-grid-row--gutters',
					'fr-my-0'
				)
			)}
			concealingBackdrop={false}
			title={'Ajouter un nouvel élément'}
			size="large"
			buttons={[
				{
					children: 'Annuler'
				},
				{
					doClosesModal: false,
					onClick: handleOnSubmit,
					children: 'Ajouter'
				}
			]}
		>
			<div
				className={fr.cx(
					'fr-grid-row',
					'fr-grid-row--center',
					'fr-grid-row--gutters',
					'fr-my-0'
				)}
			>
				<div className={cx(fr.cx('fr-col-5', 'fr-pt-3w'), classes.sideMenu)}>
					<h6>Types de champs</h6>
					{CategorySchema.options.map(category => (
						<div
							key={category}
							className={fr.cx(
								'fr-grid-row',
								'fr-grid-row--gutters',
								'fr-my-0'
							)}
						>
							<div className={fr.cx('fr-col-12')}>
								<b>{category}</b>
							</div>
							<div className={cx(fr.cx('fr-col-12'), classes.typeList)}>
								{TypeBlocksDescription.filter(t => t.category === category).map(
									typeBloc => (
										<Button
											key={typeBloc.type}
											priority={
												typeBloc.type === selectedBloc.type
													? 'primary'
													: 'tertiary'
											}
											size="small"
											title={`Ajouter un bloc ${typeBloc.name}`}
											className={cx(fr.cx('fr-mb-2v'))}
											onClick={() => {
												setSlectedBloc(typeBloc);
											}}
										>
											{typeBloc.name}
										</Button>
									)
								)}
							</div>
						</div>
					))}
				</div>
				<div className={cx(fr.cx('fr-col-7', 'fr-pt-3w'))}>
					<div
						className={
							(fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-0'),
							classes.infoRow)
						}
					>
						<div className={cx(fr.cx('fr-col-12'), classes.description)}>
							<h6>{selectedBloc.name}</h6>
							<div className={cx(fr.cx('fr-mb-5v'))}>
								{selectedBloc.description}
							</div>
						</div>
						<div className={cx(fr.cx('fr-col-12'), classes.example)}>
							<h6 className={fr.cx('fr-mt-5v')}>Exemple</h6>
						</div>
					</div>
				</div>
			</div>
		</modal.Component>
	);
};

const useStyles = tss.withName(BlockModal.name).create(() => ({
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	typeList: {
		display: 'flex',
		flexDirection: 'column'
	},
	sideMenu: {
		maxHeight: '500px',
		overflowY: 'scroll'
	},
	infoRow: {
		height: '100%'
	},
	description: {
		borderBottom: 'solid grey 1px',
		height: '40%'
	},
	example: {
		height: '60%'
	}
}));

export default BlockModal;
