'use client';

import { useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useOnClickOutside } from 'usehooks-ts';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { MoreHorizontal, Plus, X } from 'lucide-react';

import { copyList, createCard, updateList } from '@/app/actions';
import {
	Attachment,
	Card as CardModel,
	List as ListModel,
} from '@prisma/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { CardContainer } from './card';

interface CardType extends CardModel {
	attachments: Attachment[];
}

export const ListItem = (
	props: ListModel & {
		cards: CardType[];
		index: number;
	}
) => {
	const params = useParams();
	const [listTitle, setListTitle] = useState(props.title);
	const [isEditingListTitle, setIsEditingListTitle] = useState(false);
	const [cardTitle, setCardTitle] = useState('');
	const [isEditingCardTitle, setIsEditingCardTitle] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const formRef = useRef<HTMLFormElement>(null);

	useOnClickOutside(inputRef, () => {
		setIsEditingListTitle(false);
	});

	useOnClickOutside(formRef, () => {
		setIsEditingCardTitle(false);
	});

	const handleSubmit = async () => {
		const isCreated = await createCard({
			title: cardTitle,
			listId: props.id,
			boardId: params.boardId as string,
		});

		if (isCreated) {
			toast.success(`Card "${cardTitle}" created!`);
		} else {
			toast.error('Failed to create card');
		}

		setIsEditingCardTitle(false);
		setCardTitle('');
	};

	return (
		<Draggable key={props.id} draggableId={props.id} index={props.index}>
			{provided => (
				<li
					className="w-[272px] h-auto"
					key={props.id}
					ref={provided.innerRef}
					{...provided.draggableProps}
				>
					<Card
						className="p-2 min-w-[272px] h-auto space-y-2 select-none"
						{...provided.dragHandleProps}
					>
						{/* list header */}
						<div className="w-full h-8 flex justify-between items-center gap-x-2">
							{isEditingListTitle ? (
								<form
									className="w-full"
									onSubmit={async e => {
										e.preventDefault();

										const formData = new FormData(e.target as HTMLFormElement);
										const title = formData.get('title') as string;

										if (title.trim() === '') {
											return;
										}

										const isUpdated = await updateList({
											listId: props.id,
											boardId: props.boardId,
											data: {
												title,
											},
										});

										if (isUpdated) {
											toast.success(`List "${title}" updated!`);
											setListTitle(title);
										} else {
											toast.error('Failed to update list');
										}

										setIsEditingListTitle(false);
									}}
								>
									<Input
										className="px-1 py-2 w-full"
										name="title"
										ref={inputRef}
										defaultValue={listTitle}
										// value={listTitle}
										onMouseDown={e => e.stopPropagation()}
										// onChange={e => setListTitle(e.target.value)}
										autoFocus
										spellCheck={false}
									/>
								</form>
							) : (
								<div
									className="w-full text-sm font-bold cursor-pointer"
									onMouseDown={e => e.stopPropagation()}
									onClick={() => setIsEditingListTitle(true)}
								>
									{listTitle}
								</div>
							)}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost">
										<MoreHorizontal className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-modal">
									<DropdownMenuLabel>List actions</DropdownMenuLabel>
									<DropdownMenuItem onClick={() => setIsEditingCardTitle(true)}>
										Add card
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={async () => {
											const isCopied = await copyList({
												listId: props.id,
												boardId: props.boardId,
											});

											if (isCopied) {
												toast.success(`List "${props.title}" copied!`);
											} else {
												toast.error('Failed to copy list');
											}
										}}
									>
										Copy list
									</DropdownMenuItem>
									<Separator className="my-1" />
									<DropdownMenuItem
										onClick={async () => {
											const isAchieved = await updateList({
												listId: props.id,
												boardId: params.boardId as string,
												data: {
													achievedAt: new Date(),
												},
											});

											if (isAchieved) {
												toast.success(`List "${props.title}" archived!`);
											} else {
												toast.error('Failed to archive list');
											}
										}}
									>
										Achieve this list
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						{/* card list */}
						<Droppable droppableId={props.id} type="card">
							{provided => (
								<ol
									className="space-y-2"
									ref={provided.innerRef}
									{...provided.droppableProps}
								>
									{props?.cards
										.filter(card => !card.achievedAt)
										.sort((a, b) => a.order - b.order)
										.map((card, index) => (
											<Draggable
												key={card.id}
												draggableId={card.id}
												index={index}
											>
												{provided => (
													<CardContainer
														card={card}
														list={props}
														provided={provided}
													/>
												)}
											</Draggable>
										))}
									{provided.placeholder}
								</ol>
							)}
						</Droppable>
						{/* add card */}
						{isEditingCardTitle ? (
							<form
								className="space-y-3"
								ref={formRef}
								onSubmit={async e => {
									e.preventDefault();
									await handleSubmit();
								}}
							>
								<Input
									className="px-1 py-2 w-full"
									value={cardTitle}
									onMouseDown={e => e.stopPropagation()}
									onChange={e => setCardTitle(e.target.value)}
									placeholder="Enter a title for this card..."
									autoFocus
									spellCheck={false}
								/>
								<div className="inline-flex items-center gap-x-2">
									<Button>Add card</Button>
									<Button
										variant="ghost"
										onMouseDown={e => e.stopPropagation()}
										onClick={() => setIsEditingCardTitle(false)}
									>
										<X className="w-4 h-4" />
									</Button>
								</div>
							</form>
						) : (
							<Button
								className="w-full justify-start"
								variant="ghost"
								onMouseDown={e => e.stopPropagation()}
								onClick={() => setIsEditingCardTitle(true)}
							>
								<Plus className="w-4 h-4 mr-2" />
								<span>Add a card</span>
							</Button>
						)}
					</Card>
				</li>
			)}
		</Draggable>
	);
};
