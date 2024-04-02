'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import type { Board, List } from '@prisma/client';
import { updateCardOrder, updateListOrder } from '@/app/actions';
import { ListItem } from '@/components/list-item';
import { CreateList } from '@/components/create-list';
import { CardType } from '@/lib/types';

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
}

function sortByOrder(
	board: Board & { lists: (List & { cards: CardType[] })[] }
) {
	// Sort the lists by their order property
	const sortedLists = board.lists.sort((a, b) => a.order - b.order);

	// Sort the cards within each list by their order property
	return sortedLists.map(list => {
		list.cards = list.cards.sort((a, b) => a.order - b.order);
		return list;
	});
}

export const ListContainer = ({
	board,
}: {
	board: Board & { lists: (List & { cards: CardType[] })[] };
}) => {
	const [orderedData, setOrderedData] = useState(sortByOrder(board) || []);

	useEffect(() => {
		setOrderedData(sortByOrder(board) || []);
	}, [board]);

	const onDragEnd = (result: any) => {
		const { destination, source, type } = result;

		// No destination found (outside of any droppable area)
		if (!destination) return;

		// Dropped in the same position
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		// Cloning the orderedData to ensure immutability
		let newOrderedData = [...orderedData];

		if (type === 'list') {
			// Reorder lists and update their order property
			const items = reorder(
				newOrderedData,
				source.index,
				destination.index
			).map((item, index) => ({ ...item, order: index }));

			setOrderedData(items);
			updateListOrder({ boardId: board.id, items });
		} else if (type === 'card') {
			// Moving cards between lists or within the same list
			const sourceList = newOrderedData.find(
				list => list.id === source.droppableId
			);
			const destList = newOrderedData.find(
				list => list.id === destination.droppableId
			);

			if (!sourceList || !destList) return;

			// Ensure cards array exists
			sourceList.cards = sourceList.cards || [];
			destList.cards = destList.cards || [];

			if (source.droppableId === destination.droppableId) {
				// Handling moving within the same list more explicitly
				const reorderedCards = reorder(
					sourceList.cards,
					source.index,
					destination.index
				).map((card, index) => ({ ...card, order: index }));

				sourceList.cards = reorderedCards;

				setOrderedData(newOrderedData);
				updateCardOrder({
					boardId: board.id,
					items: reorderedCards,
				});
			} else {
				// Handling moving between different lists as before
				const [movedCard] = sourceList.cards.splice(source.index, 1);
				movedCard.listId = destination.droppableId;
				destList.cards.splice(destination.index, 0, movedCard);

				sourceList.cards.forEach((card, idx) => (card.order = idx));
				destList.cards.forEach((card, idx) => (card.order = idx));

				setOrderedData(newOrderedData);
				updateCardOrder({
					boardId: board.id,
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
