import { OptionsBlock } from '@/prisma/generated/zod';
import { BlockWithOptions } from '@/src/types/prismaTypesExtended';
import { TypeActions, TypeBlocksDescription, TypeConditions } from '@/src/utils/content';
import { trpc } from '@/src/utils/trpc';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import Highlight from '@codegouvfr/react-dsfr/Highlight';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import React from 'react';
import { tss } from 'tss-react/dsfr';

interface Props {
	block: BlockWithOptions;
	page: number | null;
	onAction: (block: BlockWithOptions) => void;
	allBlocks: BlockWithOptions[];
}

export type OptionValues = Omit<
	OptionsBlock,
	'id' | 'label' | 'value' | 'content'
>;

const DisplayBlocks = React.forwardRef<HTMLInputElement, Props>(
	(props: Props, ref) => {
		const { block, onAction, page, allBlocks } = props;
		const { cx, classes } = useStyles();
		const [content, setContent] = React.useState<string>(block.content || '');
		const [options, setOptions] = React.useState<OptionsBlock[]>(
			block.options || []
		);

		const questionBlocks = allBlocks.filter(block => {
			return TypeBlocksDescription.filter(t => t.category === 'Questions')
				.map(t => t.type)
				.includes(block.type_bloc);
		});

		React.useEffect(() => {
			if (block.type_bloc === 'logic') {
				setOptions(block.options);
			}
		}, [block]);

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
			onSuccess: option => {
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

		const saveOption = trpc.options.update.useMutation({});

		const handleSaveOption = async (tmpOption: OptionsBlock) => {
			try {
				const { id, content } = tmpOption;
				const blockSaved = await saveOption.mutateAsync({
					id,
					content
				});
			} catch (e) {
				console.error(e);
			}
		};

		const deleteOption = trpc.options.delete.useMutation({});

		const handleDeleteOption = async (index: number) => {
			try {
				await deleteOption.mutateAsync({
					id: index
				});
			} catch (e) {
				console.error(e);
			}
		};

		const renderPreInput = (block: BlockWithOptions) => {
			switch (block.type_bloc) {
				default:
					return <></>;
			}
		};

		const renderPostInput = (block: BlockWithOptions) => {
			switch (block.type_bloc) {
				case 'heading_1':
				case 'heading_2':
				case 'heading_3':
				case 'input_text':
				case 'input_text_area':
					return (
						<Input
							ref={ref}
							className={cx(fr.cx('fr-mb-0'), classes.block)}
							label=""
							hintText={
								TypeBlocksDescription.find(t => t.type === block.type_bloc)
									?.hint
							}
							nativeInputProps={{
								onChange: e => {
									setContent(e.target.value);
								},
								value: content || ''
							}}
						/>
					);
				case 'paragraph':
					return (
						<Input
							ref={ref}
							className={cx(fr.cx('fr-mb-0'), classes.block)}
							textArea
							label=""
							hintText={
								TypeBlocksDescription.find(t => t.type === block.type_bloc)
									?.hint
							}
							nativeTextAreaProps={{
								onChange: e => {
									setContent(e.target.value);
								},
								value: content || ''
							}}
						/>
					);
				case 'new_page':
					return (
						<>
							<Input
								ref={ref}
								className={cx(fr.cx('fr-mb-0'), classes.block)}
								label=""
								hintText={
									TypeBlocksDescription.find(t => t.type === block.type_bloc)
										?.hint
								}
								nativeInputProps={{
									onChange: e => {
										setContent(e.target.value);
									},
									value: content || ''
								}}
							/>
							<div
								className={cx(
									fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-0')
								)}
							>
								<div className={fr.cx('fr-col-12')}>
									<hr className={cx(classes.divider)} />
								</div>
								<div className={fr.cx('fr-col-12')}>
									<h5>Page {page}</h5>
								</div>
							</div>
						</>
					);
				case 'radio':
				case 'checkbox':
				case 'select':
					return (
						<>
							<Input
								ref={ref}
								className={cx(fr.cx('fr-mb-0'), classes.block)}
								label=""
								hintText={
									TypeBlocksDescription.find(t => t.type === block.type_bloc)
										?.hint
								}
								nativeInputProps={{
									onChange: e => {
										setContent(e.target.value);
									},
									value: content || ''
								}}
							/>
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
													const updatedOptions = [...options];
													updatedOptions[index] = {
														...updatedOptions[index],
														content: e.target.value
													};
													handleSaveOption(updatedOptions[index]);
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
												handleDeleteOption(option.id);
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
										updated_at: new Date()
									});
								}}
							>
								Ajouter une option
							</Button>
						</>
					);
				case 'logic':
					return (
						<Highlight>
							<div
								className={cx(
									fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-0')
								)}
							>
								<div className={fr.cx('fr-col-4')}>
									<Select
										label="Quand"
										nativeSelectProps={{
											name: '',
											value:
												options.find(o => o.label === 'when')?.content || '',
											onChange: e => {
												const updatedOptions = [...options];
												const optionIndex = updatedOptions.findIndex(
													o => o.label === 'when'
												);
												if (optionIndex !== -1) {
													updatedOptions[optionIndex] = {
														...updatedOptions[optionIndex],
														content: e.target.value
													};
													handleSaveOption(updatedOptions[optionIndex]);
													setOptions(updatedOptions);
												}
											}
										}}
									>
										<option disabled hidden selected value="">
											Selectionnez une question
										</option>
										{questionBlocks.map(tmpBlock => {
											return (
												<option key={tmpBlock.id} value={tmpBlock.id}>
													{tmpBlock.content}
												</option>
											);
										})}
									</Select>
								</div>
								<div className={fr.cx('fr-col-4')}>
									<Select
										label="Condition"
										nativeSelectProps={{
											name: '',
											value:
												options.find(o => o.label === 'condition')?.content ||
												'',
											onChange: e => {
												const updatedOptions = [...options];
												const optionIndex = updatedOptions.findIndex(
													o => o.label === 'condition'
												);
												if (optionIndex !== -1) {
													updatedOptions[optionIndex] = {
														...updatedOptions[optionIndex],
														content: e.target.value
													};
													handleSaveOption(updatedOptions[optionIndex]);
													setOptions(updatedOptions);
												}
											}
										}}
									>
										<option disabled hidden selected value="">
											Selectionnez une condition
										</option>
										{TypeConditions.map(typeC => {
											return (
												<option key={typeC.value} value={typeC.value}>
													{typeC.label}
												</option>
											);
										})}
									</Select>
								</div>
								<div className={fr.cx('fr-col-4')}>
									{['contains', 'notContain'].includes(
										options.find(o => o.label === 'condition')?.content || ''
									) && (
										<Input
											ref={ref}
											className={cx(fr.cx('fr-mb-0'), classes.block)}
											label="Valeur"
											nativeInputProps={{
												onChange: e => {
													const updatedOptions = [...options];
													const optionIndex = updatedOptions.findIndex(
														o => o.label === 'value'
													);
													if (optionIndex !== -1) {
														updatedOptions[optionIndex] = {
															...updatedOptions[optionIndex],
															content: e.target.value
														};
														handleSaveOption(updatedOptions[optionIndex]);
														setOptions(updatedOptions);
													}
												},
												value:
													options.find(o => o.label === 'value')?.content || ''
											}}
										/>
									)}
								</div>
							</div>
							<div
								className={cx(
									fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-my-0')
								)}
							>
								<div className={fr.cx('fr-col-4')}>
									<Select
										label="Alors"
										nativeSelectProps={{
											name: '',
											value:
												options.find(o => o.label === 'then')?.content || '',
											onChange: e => {
												const updatedOptions = [...options];
												const optionIndex = updatedOptions.findIndex(
													o => o.label === 'then'
												);
												if (optionIndex !== -1) {
													updatedOptions[optionIndex] = {
														...updatedOptions[optionIndex],
														content: e.target.value
													};
													handleSaveOption(updatedOptions[optionIndex]);
													setOptions(updatedOptions);
												}
											}
										}}
									>
										<option disabled hidden selected value="">
											Selectionnez un bloc
										</option>
										{allBlocks
											.filter(block => block.type_bloc !== 'logic')
											.map(tmpBlock => {
												return (
													<option key={tmpBlock.id} value={tmpBlock.id}>
														{tmpBlock.content}
													</option>
												);
											})}
									</Select>
								</div>
								<div className={fr.cx('fr-col-4')}>
									<Select
										label="Action"
										nativeSelectProps={{
											name: '',
											value:
												options.find(o => o.label === 'action')?.content ||
												'',
											onChange: e => {
												const updatedOptions = [...options];
												const optionIndex = updatedOptions.findIndex(
													o => o.label === 'action'
												);
												if (optionIndex !== -1) {
													updatedOptions[optionIndex] = {
														...updatedOptions[optionIndex],
														content: e.target.value
													};
													handleSaveOption(updatedOptions[optionIndex]);
													setOptions(updatedOptions);
												}
											}
										}}
									>
										<option disabled hidden selected value="">
											Selectionnez une action
										</option>
										{TypeActions.map(typeC => {
											return (
												<option key={typeC.value} value={typeC.value}>
													{typeC.label}
												</option>
											);
										})}
									</Select>
								</div>
							</div>
						</Highlight>
					);
				default:
					return <></>;
			}
		};

		return (
			<div className={cx(classes.blockInput)}>
				{renderPreInput(block)}
				{renderPostInput(block)}
			</div>
		);
	}
);

const useStyles = tss.withName(DisplayBlocks.name).create(() => ({
	blockInput: {
		['textarea']: {
			minHeight: '150px'
		}
	},
	errorColor: {
		color: fr.colors.decisions.text.default.error.default
	},
	optionButton: {
		marginTop: '35px'
	},
	block: {
		minHeight: '1.5rem'
	},
	optionContainer: {
		width: '200px'
	},
	divider: {
		marginTop: '2rem'
	}
}));

export default DisplayBlocks;
