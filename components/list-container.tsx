'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import type { Board, List } from '@prisma/client';
import { updateCardOrder, updateListOrder } from '@/app/actions';
import { ListItem } from '@/components/list-item';
import { CreateList } from '@/components/create-list';
import { CardType } from '@/lib/types';

export const ListContainer = ({
	board,
}: {
	board: Board & { lists: (List & { cards: CardType[] })[] };
}) => {
	const [orderedData, setOrderedData] = useState(board.lists || []);

	useEffect(() => {
		setOrderedData(board.lists || []);
	}, [board]);

	function reorder<T>(list: T[], startIndex: number, endIndex: number) {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	}

	const onDragEnd = (result: any) => {
		const { destination, source, type } = result;

		if (!destination) {
			return;
		}

		// if dropped in the same position
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		// User moves a list
		if (type === 'list') {
			const items = reorder(orderedData, source.index, destination.index).map(
				(item, index) => ({ ...item, order: index })
			);

			setOrderedData(items);
			updateListOrder({ boardId: board.id, items });
		}

		// User moves a card
		if (type === 'card') {
			let newOrderedData = [...orderedData];

			// Source and destination list
			const sourceList = newOrderedData.find(
				list => list.id === source.droppableId
			);
			const destList = newOrderedData.find(
				list => list.id === destination.droppableId
			);

			if (!sourceList || !destList) {
				return;
			}

			// Check if cards exists on the sourceList
			if (!sourceList.cards) {
				sourceList.cards = [];
			}

			// Check if cards exists on the destList
			if (!destList.cards) {
				destList.cards = [];
			}

			// Moving the card in the same list
			if (source.droppableId === destination.droppableId) {
				const reorderedCards = reorder(
					sourceList.cards,
					source.index,
					destination.index
				).map((card, index) => ({ ...card, order: index }));

				sourceList.cards = reorderedCards;

				setOrderedData(newOrderedData);
				updateCardOrder({
					boardId: board.id,
					listId: sourceList.id,
					items: sourceList.cards,
				});
				// User moves the card to another list
			} else {
				// Remove card from the source list
				const [movedCard] = sourceList.cards.splice(source.index, 1);

				// Assign the new listId to the moved card
				movedCard.listId = destination.droppableId;

				// Add card to the destination list
				destList.cards.splice(destination.index, 0, movedCard);
				sourceList.cards = sourceList.cards.map((card, idx) => ({
					...card,
					order: idx,
				}));

				// Update the order for each card in the destination list
				destList.cards = destList.cards.map((card, idx) => ({
					...card,
					order: idx,
				}));

				setOrderedData(newOrderedData);
				updateCardOrder({
					boardId: board.id,
					listId: sourceList.id,
					items: destList.cards,
				});
			}
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="lists" type="list" direction="horizontal">
				{provided => (
					<ol
						className="flex gap-x-3 h-full"
						ref={provided.innerRef}
						{...provided.droppableProps}
					>
						{orderedData
							?.filter(list => !list.achievedAt)
							.sort((a, b) => a.order - b.order)
							.map((list, index) => (
								<ListItem key={list.id} index={index} {...list} />
							))}
						{provided.placeholder}
						<li>
							<CreateList />
						</li>
					</ol>
				)}
			</Droppable>
		</DragDropContext>
	);
};
