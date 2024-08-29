import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Block, Form } from '@/prisma/generated/zod';
import FormLayout from '@/src/layouts/Form/FormLayout';
import Button from '@codegouvfr/react-dsfr/Button';
import { trpc } from '@/src/utils/trpc';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import BlockModal from '@/src/components/dashboard/Form/BlockModal';

interface Props {
	form: Form;
}

export type BlockValues = Omit<Block, 'id' | 'label' | 'value' | 'content'>;

const blockModal = createModal({
	id: 'block-modal',
	isOpenedByDefault: false
});

export type FormElementType = 'title' | 'paragraph' | 'text' | 'select';

export interface FormLine {
	type: FormElementType;
	content: string;
}

const FormBuilder = (props: Props) => {
	const { form } = props;

	const router = useRouter();

	const { classes, cx } = useStyles();
	const [formLines, setFormLines] = useState<FormLine[]>([
		{ type: 'paragraph', content: '' }
	]);
	const [showModal, setShowModal] = useState(false);
	const [activeLine, setActiveLine] = useState(0);
	const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
	const [hoveredLine, setHoveredLine] = useState<number | null>(null);

	const deleteBlock = trpc.block.delete.useMutation({
		onSuccess: () => {
			refetchBlocks();
		}
	});

	const createBlock = trpc.block.create.useMutation({
		onSuccess: () => {
			refetchBlocks();
		}
	});

	const handleCreateBlock = async (newBlock: BlockValues) => {
		try {
			const blockCreated = await createBlock.mutateAsync({
				...newBlock
			});
		} catch (e) {
			console.error(e);
		}
	};

	const saveBlock = trpc.block.update.useMutation({
		onSuccess: () => {
			refetchBlocks();
		}
	});

	const {
		data: blocksResult,
		isLoading: isLoadingBlocks,
		refetch: refetchBlocks,
		isRefetching: isRefetchingBlocks,
		isFetched: isBlocksFetched
	} = trpc.block.getByFormId.useQuery(
		{
			form_id: form.id
		},
		{
			initialData: {
				data: [],
				metadata: {
					blockCount: 0
				}
			},
			enabled: form?.id !== undefined
		}
	);

	const {
		data: formBlocks,
		metadata: { blockCount: blockCount }
	} = blocksResult;

	const [hasCheckedFirstLoad, setHasCheckedFirstLoad] = useState(false);

	useEffect(() => {
		if (!hasCheckedFirstLoad && isBlocksFetched) {
			if (!formBlocks || formBlocks.length === 0) {
				console.log('Aucun bloc trouvé, effectuez une action ici');
				handleCreateBlock({
					form_id: form.id,
					created_at: new Date(),
					updated_at: new Date(),
					type_bloc: 'paragraph',
					position: 0
				});
			}
			setHasCheckedFirstLoad(true);
		}
	}, [hasCheckedFirstLoad, isBlocksFetched, formBlocks]);

	useEffect(() => {
		inputRefs.current[activeLine]?.focus();
	}, [activeLine]);

	const onCreateBlock = () => {
		setTimeout(() => {
			blockModal.open();
		}, 100);
	};

	const handleAddElement = (type: FormElementType) => {
		const newFormLines = [...formLines];
		newFormLines[activeLine] = { type, content: '' };
		setFormLines(newFormLines);
		setShowModal(false);
	};

	const handleKeyDown = async (
		e: KeyboardEvent<HTMLDivElement>,
		index: number
	) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await handleCreateBlock({
				form_id: form.id,
				created_at: new Date(),
				updated_at: new Date(),
				type_bloc: 'paragraph',
				position: index + 1
			});
			setActiveLine(index + 1);
		}
	};

	const handleDeleteLine = async (index: number) => {
		try {
			await deleteBlock.mutateAsync({
				id: formBlocks[index].id,
				position: index
			});
		} catch (e) {
			console.error(e);
		}
	};

	const renderLine = (line: Block, index: number) => {
		return (
			<div
				className={classes.formLineContainer}
				onFocus={() => setActiveLine(index)}
				onMouseEnter={() => setHoveredLine(index)}
				onMouseLeave={() => setHoveredLine(null)}
				onKeyDown={e => handleKeyDown(e, index)}
			>
				<Button
					iconId="fr-icon-delete-bin-line"
					priority="tertiary"
					size="small"
					title="Supprimer le bloc"
					className={cx(
						fr.cx('fr-mr-5v'),
						classes.iconError,
						classes.actionButton,
						hoveredLine === index || activeLine === index ? classes.visible : ''
					)}
					onClick={() => handleDeleteLine(index)}
				></Button>
				<Button
					iconId="fr-icon-file-add-line"
					priority="tertiary"
					size="small"
					title="Ajouter un bloc"
					className={cx(
						fr.cx('fr-mr-5v'),
						classes.actionButton,
						hoveredLine === index || activeLine === index ? classes.visible : ''
					)}
					onClick={onCreateBlock}
				></Button>
				<Button
					iconId="fr-icon-drag-move-2-line"
					priority="tertiary"
					size="small"
					title="Déplacer le bloc"
					className={cx(
						fr.cx('fr-mr-5v'),
						classes.actionButton,
						hoveredLine === index || activeLine === index ? classes.visible : ''
					)}
					onClick={() => setShowModal(true)}
				></Button>
				<div
					className={classes.formLine}
					contentEditable
					suppressContentEditableWarning
					ref={el => (inputRefs.current[index] = el)}
				>
					{line.content || ''}
				</div>
			</div>
		);
	};

	return (
		<FormLayout form={form}>
			<Head>
				<title>{form.title} | Form builder | Je donne mon avis</title>
				<meta
					name="description"
					content={`${form.title} | Form Builder | Je donne mon avis`}
				/>
			</Head>
			<BlockModal
				modal={blockModal}
				onSubmit={newBlock => handleCreateBlock(newBlock)}
			/>
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h1>Form Builder</h1>
				</div>
			</div>
			<div className={classes.formBuilder}>
				{formBlocks.map((line, index) => (
					<div key={index}>{renderLine(line, index)}</div>
				))}
				{showModal && (
					<div className={classes.modalOverlay}>
						<div className={classes.modalContent}>
							<button onClick={() => handleAddElement('title')}>Title</button>
							<button onClick={() => handleAddElement('paragraph')}>
								Paragraph
							</button>
							<button onClick={() => handleAddElement('text')}>
								Text Input
							</button>
							<button onClick={() => handleAddElement('select')}>Select</button>
						</div>
					</div>
				)}
			</div>
		</FormLayout>
	);
};

const useStyles = tss.withName(FormBuilder.name).create({
	iconError: {
		color: fr.colors.decisions.text.default.error.default
	},
	headerWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	column: {
		display: 'flex',
		flexDirection: 'column',
		gap: fr.spacing('10v')
	},
	formBuilder: {
		maxWidth: '600px',
		margin: '0 auto',
		fontFamily: 'Arial, sans-serif'
	},
	formLineContainer: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: '10px',
		position: 'relative'
	},
	actionButton: {
		visibility: 'hidden' // Hidden by default
	},
	visible: {
		visibility: 'visible' // Make the button visible when hovered or focused
	},
	formLine: {
		flexGrow: 1,
		padding: '10px',
		border: '1px solid #ddd',
		borderRadius: '4px',
		backgroundColor: '#f9f9f9',
		position: 'relative',
		outline: 'none'
	},
	emptyLine: {
		backgroundColor: '#e0e0e0',
		border: '2px dashed #ccc'
	},
	button: {
		padding: '5px 10px',
		marginRight: '5px',
		cursor: 'pointer'
	},
	modalOverlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	modalContent: {
		backgroundColor: 'white',
		padding: '20px',
		borderRadius: '4px'
	},
	cursor: {
		borderRight: '2px solid black',
		animation: 'blink 1s step-end infinite',
		'@keyframes blink': {
			'from, to': { borderColor: 'transparent' },
			'50%': { borderColor: 'black' }
		}
	}
});

export default FormBuilder;

export { getServerSideProps };
