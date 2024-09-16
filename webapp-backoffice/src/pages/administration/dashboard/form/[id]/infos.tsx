import React from 'react';
import { getServerSideProps } from '.';
import { fr } from '@codegouvfr/react-dsfr';
import { tss } from 'tss-react/dsfr';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Form } from '@/prisma/generated/zod';
import FormLayout from '@/src/layouts/Form/FormLayout';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface Props {
	form: Form;
}

interface Item {
	id: string;
	content: string;
	index: number;
}

interface DragItem {
	index: number;
	id: string;
	type: string;
}

const ItemType = 'ITEM';

const DraggableItem: React.FC<{
	item: Item;
	moveItem: (dragIndex: number, hoverIndex: number) => void;
}> = ({ item, moveItem }) => {
	const ref = React.useRef<HTMLDivElement>(null);

	const [, drop] = useDrop({
		accept: ItemType,
		hover(draggedItem: DragItem, monitor: DropTargetMonitor) {
			if (!ref.current) {
				return;
			}
			const dragIndex = draggedItem.index;
			const hoverIndex = item.index;

			if (dragIndex === hoverIndex) {
				return;
			}

			const hoverBoundingRect = ref.current?.getBoundingClientRect();
			const hoverMiddleY =
				(hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
			const clientOffset = monitor.getClientOffset();
			const hoverClientY =
				(clientOffset as { x: number; y: number }).y - hoverBoundingRect.top;

			if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
				return;
			}

			if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
				return;
			}

			moveItem(dragIndex, hoverIndex);
			draggedItem.index = hoverIndex;
		}
	});

	const [{ isDragging }, drag] = useDrag({
		type: ItemType,
		item: { id: item.id, index: item.index },
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging()
		})
	});

	drag(drop(ref));

	return (
		<div
			ref={ref}
			style={{
				opacity: isDragging ? 0.5 : 1,
				userSelect: 'none',
				padding: '16px',
				margin: '0 0 8px 0',
				backgroundColor: '#456C86',
				color: 'white',
				cursor: 'move'
			}}
		>
			{item.content}
		</div>
	);
};

const FormBuilder: React.FC<Props> = props => {
	const { form } = props;

	const [items, setItems] = React.useState<Item[]>([
		{ id: '1', content: 'Item 1', index: 0 },
		{ id: '2', content: 'Item 2', index: 1 },
		{ id: '3', content: 'Item 3', index: 2 }
	]);

	const moveItem = (dragIndex: number, hoverIndex: number) => {
		const newItems = [...items];
		const [movedItem] = newItems.splice(dragIndex, 1);
		newItems.splice(hoverIndex, 0, movedItem);
		setItems(
			newItems.map((item, index) => ({
				...item,
				index
			}))
		);
	};

	const { classes } = useStyles();

	return (
		<FormLayout form={form}>
			<Head>
				<title>{form.title} | Form Informations | Je donne mon avis</title>
				<meta
					name="description"
					content={`${form.title} | Form Informations | Je donne mon avis`}
				/>
			</Head>
			<div className={classes.column}>
				<div className={classes.headerWrapper}>
					<h1>Informations</h1>
				</div>
				<DndProvider backend={HTML5Backend}>
					<div className={classes.droppableArea}>
						{items.map(item => (
							<DraggableItem key={item.id} item={item} moveItem={moveItem} />
						))}
					</div>
				</DndProvider>
			</div>
		</FormLayout>
	);
};

const useStyles = tss.withName(FormBuilder.name).create({
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
	droppableArea: {
		padding: '8px',
		backgroundColor: '#f4f4f4',
		minHeight: '200px'
	}
});

export default FormBuilder;

export { getServerSideProps };
