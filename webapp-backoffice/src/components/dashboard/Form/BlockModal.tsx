import { Block, Form } from '@/prisma/generated/zod';
import { BlockValues } from '@/src/pages/administration/dashboard/form/[id]/builder';
import { TypeBlocksDescription } from '@/src/utils/content';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { Typebloc } from '@prisma/client';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
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
}

export type TypeBlocsInput = {
	type: Typebloc;
	name: String;
	description: String;
};

const BlockModal = (props: Props) => {
	const { modal, onSubmit } = props;
	const { cx, classes } = useStyles();
	const [selectedBloc, setSlectedBloc] = React.useState<TypeBlocsInput>(
		TypeBlocksDescription[0]
	);

	const {
		control,
		handleSubmit,
		setError,
		reset,
		formState: { errors }
	} = useForm<Block>({
		defaultValues: {}
	});

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
			title={'Ajouter un nouveau bloc'}
			size="large"
			buttons={[
				{
					children: 'Annuler'
				},
				{
					doClosesModal: false,
					onClick: handleSubmit(onSubmit),
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
				<div className={fr.cx('fr-col-5', 'fr-pt-3w')}>
					<h6>Types de champs</h6>
					<div className={cx(classes.sideMenu)}>
						{TypeBlocksDescription.map(typeBloc => (
							<Button
								priority={
									typeBloc.type === selectedBloc.type ? 'primary' : 'tertiary'
								}
								title={`Ajouter un bloc ${typeBloc.name}`}
								className={cx(fr.cx('fr-mb-5v'), classes.sideMenu)}
								onClick={() => {
									setSlectedBloc(typeBloc);
								}}
							>
								{typeBloc.name}
							</Button>
						))}
					</div>
				</div>
				<div className={fr.cx('fr-col-7', 'fr-pt-3w')}>
					<h6>Description</h6>
					<div className={cx(fr.cx('fr-mb-5v'), classes.sideMenu)}>
						{selectedBloc.description}
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
	sideMenu: {
		display: 'flex',
		flexDirection: 'column'
	},
	sideMenuItem: {}
}));

export default BlockModal;
