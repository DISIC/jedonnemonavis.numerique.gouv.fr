import { Block, BlockPartialWithRelations, BlockWithRelations, Form, OptionsBlock, OptionsBlockPartial } from '@/prisma/generated/zod';
import { BlockWithOptions } from '@/src/types/prismaTypesExtended';
import { TypeBlocksDescription } from '@/src/utils/content';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	block: BlockWithOptions;
	onAction: (block: BlockWithOptions) => void;
}

export type OptionValues = Omit<OptionsBlock, 'id' | 'label' | 'value' | 'content'>;

const DisplayBlocks = React.forwardRef<HTMLInputElement, Props>(
	(props: Props, ref) => {
		const { block, onAction } = props;
		const { cx, classes } = useStyles();
		const [content, setContent] = React.useState<string>(block.content || '');
		const [options, setOptions] = React.useState<OptionsBlock[]>(block.options || []);

		React.useEffect(() => {
			setContent(block.content || '');
		}, [block.content]);

		const handleSave = () => {
			onAction({ ...block, content: content });
		};

		React.useEffect(() => {
			const handler = setTimeout(() => {
				handleSave();
			}, 1000);
			return () => {
				clearTimeout(handler);
			};
		}, [content]);

		const createOption = trpc.options.create.useMutation({
			onSuccess: (option) => {
				setOptions([...options, option.data]);
			}
		});

		const handleCreateOption = async (newOption: OptionValues) => {
			try {
				const optionCreated = await createOption.mutateAsync({
					...newOption
				});
				return optionCreated;
			} catch (e) {
				console.error(e);
			}
		};
	
		const saveOption = trpc.options.update.useMutation({
		});

		const handleSaveOption = async (tmpOption: OptionsBlock) => {
			try {
	
				const {id, content} = tmpOption;
				const blockSaved = await saveOption.mutateAsync({
					id, content
				});
			} catch (e) {
				console.error(e);
			}
		};

		const renderBlock = (block: BlockWithOptions) => {
			switch (block.type_bloc) {
				case 'paragraph':
					return <></>;
				case 'heading_1':
				case 'heading_2':
				case 'heading_3':
					return <></>;
				case 'input_text':
				case 'input_text_area':
					return <></>;
				case 'radio':
				case 'checkbox':
				case 'select':
					return (
						<>
							{options.map((option, index) => (
								<div
									key={option.id}
									className={cx(
										fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-0')
									)}
								>
									<div
										key={option.id}
										className={cx(fr.cx('fr-col-md-4', 'fr-py-0'))}
									>
										<Input
											ref={ref}
											className={cx(fr.cx('fr-mb-0'), classes.block)}
											label=""
											hintText={`Option ${index + 1}`}
											nativeInputProps={{
												onChange: e => {
													// Copier les options actuelles
													const updatedOptions = [...options];

													// Modifier l'option spécifique
													updatedOptions[index] = {
														...updatedOptions[index],
														content: e.target.value
													};

													handleSaveOption(updatedOptions[index]);

													// Mettre à jour l'état avec les options modifiées
													setOptions(updatedOptions);
												},
												value: option.content || ''
											}}
										/>
									</div>
									<div className={cx(fr.cx('fr-col-md-2', 'fr-py-0'))}>
										<Button
											iconId="fr-icon-delete-bin-line"
											priority="tertiary"
											size="small"
											title="Supprimer l'option"
											onClick={() => {
												const updatedOptions = options.filter(
													(_, indexT) => indexT !== index
												);
												setOptions(updatedOptions);
											}}
											className={cx(
												fr.cx('fr-mr-5v'),
												classes.errorColor,
												classes.optionButton
											)}
										/>
									</div>
								</div>
							))}
							<Button
								priority="primary"
								size="small"
								title="Ajouter une option de réponse"
								className={fr.cx('fr-mt-5v')}
								onClick={async () => {
									const newOption = await handleCreateOption({
										block_id: block.id,
										created_at: new Date(),
										updated_at: new Date(),
									});
								}}
							>
								Ajouter une option
							</Button>
						</>
					);
				default:
					return <></>;
			}
		};

		return (
			<div>
				<Input
					ref={ref}
					className={cx(fr.cx('fr-mb-0'), classes.block)}
					label=""
					hintText={
						TypeBlocksDescription.find(t => t.type === block.type_bloc)?.hint
					}
					nativeInputProps={{
						onChange: e => {
							setContent(e.target.value);
						},
						value: content || ''
					}}
				/>
				{renderBlock(block)}
			</div>
		);
	}
);

const useStyles = tss.withName(DisplayBlocks.name).create(() => ({
	errorColor: {
		color: fr.colors.decisions.text.default.error.default
	},
	optionButton: {
		marginTop: '35px'
	},
	block: {
		minHeight: '1.5rem'
	},
	heading_1: {
		fontSize: '2.5rem'
	},
	heading_2: {
		fontSize: '2.rem'
	},
	heading_3: {
		fontSize: '1.5rem'
	},
	asterisk: {
		color: fr.colors.decisions.text.default.error.default
	},
	optionContainer: {
		width: '200px'
	}
}));

export default DisplayBlocks;
