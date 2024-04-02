'use server';

import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { Attachment, Board, Card, List } from '@prisma/client';

import prisma from '@/lib/db';
import { Label, Checklist } from '@/lib/types';
import { isChecklist, isLabel } from '@/lib/utils';

// board
export async function createBoard(data: {
	title: string;
	imageThumbUrl: string;
	imageFullUrl: string;
}): Promise<boolean> {
	const { userId, orgId } = auth();

	if (!userId || !orgId) throw new Error('Not authenticated');

	const { title, imageThumbUrl, imageFullUrl } = data;

	if (!title || !imageThumbUrl || !imageFullUrl) {
		throw new Error('Invalid data');
	}

	let board;

	try {
		board = await prisma.board.create({
			data: {
				orgId,
				title,
				imageThumbUrl,
				imageFullUrl,
			},
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`w/${orgId}`);
	return true;
}

export async function getBoards(): Promise<Board[] | null> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	let boards;

	try {
		boards = await prisma.board.findMany({
			where: {
				orgId,
			},
			include: {
				lists: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	} catch (error) {
		console.error('error:', error);
		return null;
	}

	return boards;
}

export async function getBoard(id: string): Promise<Board | null> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	let board;

	try {
		board = await prisma.board.findUnique({
			where: {
				id,
			},
			include: {
				lists: {
					include: {
						cards: {
							include: {
								attachments: true,
							},
						},
					},
				},
			},
		});
	} catch (error) {
		console.error('error:', error);
		return null;
	}

	return board;
}

export async function updateBoard(
	id: string,
	data: {
		title?: string;
		imageThumbUrl?: string;
		starred?: boolean;
		closedAt?: Date | null;
	}
): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	// Ensure there's at least one property to update
	if (Object.values(data).every(value => value === undefined)) {
		throw new Error('Invalid data');
	}

	let board;

	try {
		await prisma.board.update({
			where: {
				id,
			},
			data,
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`w/${orgId}`);
	return true;
}

export async function deleteBoard(id: string): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	try {
		await prisma.board.delete({
			where: {
				id,
			},
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`w/${orgId}`);
	return true;
}

// list
export async function createList(data: {
	boardId: string;
	title: string;
}): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	const { boardId, title } = data;

	if (!boardId || !title) {
		throw new Error('Invalid data');
	}

	const lastOrder = await prisma.list.findFirst({
		where: {
			boardId,
		},
		orderBy: {
			order: 'desc',
		},
	});

	const order = lastOrder ? lastOrder.order + 1 : 0;

	try {
		await prisma.list.create({
			data: {
				boardId,
				title,
				order,
			},
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`b/${boardId}`);
	return true;
}

export async function updateList({
	listId,
	boardId,
	data,
}: {
	listId: string;
	boardId: string;
	data: {
		title?: string;
		achievedAt?: Date | null;
	};
}): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	if (!listId || !boardId || !data) {
		throw new Error('Invalid data');
	}

	try {
		await prisma.list.update({
			where: {
				id: listId,
			},
			data,
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/b/${boardId}}`);
	return true;
}

export async function updateListOrder({
	boardId,
	items,
}: {
	boardId: string;
	items: List[];
}): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	if (!boardId || !items) {
		throw new Error('Invalid data');
	}

	let lists;

	try {
		const transaction = items.map(list =>
			prisma.list.update({
				where: {
					id: list.id,
				},
				data: {
					order: list.order,
				},
			})
		);

		lists = await prisma.$transaction(transaction);
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/board/${boardId}`);
	return true;
}

export async function copyList({
	listId,
	boardId,
}: {
	listId: string;
	boardId: string;
}): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	if (!listId || !boardId) throw new Error('Invalid data');

	const listToCopy = await prisma.list.findUnique({
		where: {
			id: listId,
		},
		include: {
			cards: {
				include: {
					attachments: true,
				},
			},
		},
	});

	if (!listToCopy) throw new Error('List not found');

	const lastList = await prisma.list.findFirst({
		where: {
			boardId,
		},
		orderBy: {
			order: 'desc',
		},
		select: {
			order: true,
		},
	});

	const order = lastList ? lastList.order + 1 : 0;

	const { id, ...newData } = listToCopy;

	try {
		await prisma.list.create({
			data: {
				...newData,
				title: `${listToCopy.title} (copy)`,
				order,
				cards: {
					create: listToCopy.cards.map(({ id, listId, ...card }) => ({
						...card,
						labels: isLabel(card.labels) ? card.labels : undefined,
						checklist: isChecklist(card.checklist) ? card.checklist : undefined,
						attachments: {
							create: card.attachments.map(({ name, filePath }) => ({
								name,
								filePath,
							})),
						},
					})),
				},
			},
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/b/${boardId}`);
	return true;
}

// card
export async function createCard(data: {
	listId: string;
	title: string;
	boardId: string;
}): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	const { listId, title } = data;

	if (!listId || !title) {
		throw new Error('Invalid data');
	}

	const lastCard = await prisma.card.findFirst({
		where: {
			listId,
		},
		orderBy: {
			order: 'desc',
		},
	});

	const order = lastCard ? lastCard.order + 1 : 0;

	try {
		await prisma.card.create({
			data: {
				listId,
				title,
				order,
			},
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`b/${data.boardId}`);
	return true;
}

export async function updateCardOrder({
	boardId,
	items,
}: {
	boardId: string;
	items: Card[];
}): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	if (!boardId || !items) {
		throw new Error('Invalid data');
	}

	try {
		const transaction = items.map(card =>
			prisma.card.update({
				where: {
					id: card.id,
				},
				data: {
					order: card.order,
					listId: card.listId,
				},
			})
		);

		await prisma.$transaction(transaction);
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/b/${boardId}}`);
	return true;
}

export async function updateCard({
	cardId,
	boardId,
	data,
}: {
	cardId: string;
	boardId: string;
	data: {
		title?: string;
		description?: string;
		labels?: Label[];
		checklist?: Checklist[];
		startDate?: Date | null;
		dueDate?: Date | null;
		coverImgUrl?: string | null;
		achievedAt?: Date | null;
	};
}): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	if (!cardId || !boardId || !data) {
		throw new Error('Invalid data');
	}

	try {
		await prisma.card.update({
			where: {
				id: cardId,
			},
			// @ts-ignore
			data,
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/b/${boardId}}`);
	return true;
}

export async function copyCard({
	cardId,
	boardId,
}: {
	cardId: string;
	boardId: string;
}): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	if (!cardId || !boardId) throw new Error('Invalid data');

	const cardToCopy = await prisma.card.findUnique({
		where: {
			id: cardId,
		},
		include: {
			attachments: true,
		},
	});

	if (!cardToCopy) throw new Error('Card not found');

	const lastCard = await prisma.card.findFirst({
		where: {
			listId: cardToCopy.listId,
		},
		orderBy: {
			order: 'desc',
		},
		select: {
			order: true,
		},
	});

	const newOrder = lastCard ? lastCard.order + 1 : 0;

	const { id, ...newData } = cardToCopy;

	try {
		await prisma.card.create({
			data: {
				...newData,
				title: `${cardToCopy.title} (copy)`,
				labels: isLabel(cardToCopy.labels) ? cardToCopy.labels : undefined,
				checklist: isChecklist(cardToCopy.checklist)
					? cardToCopy.checklist
					: undefined,
				order: newOrder,
				attachments: {
					create: cardToCopy.attachments.map(({ name, filePath }) => ({
						name,
						filePath,
					})),
				},
			},
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/b/${boardId}`);
	return true;
}

// attachment
export async function createAttachment(
	boardId: string,
	data: {
		cardId: string;
		name: string;
		filePath: string;
	}
): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	const { cardId, name, filePath } = data;

	if (!cardId || !boardId || !name || !filePath) {
		throw new Error('Invalid data');
	}

	try {
		await prisma.attachment.create({
			data,
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/b/${boardId}`);
	return true;
}

export async function deleteAttachment(
	attachmentId: string,
	boardId: string
): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	try {
		await prisma.attachment.delete({
			where: {
				id: attachmentId,
			},
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/b/${boardId}`);
	return true;
}

export async function updateAttachment(
	attachmentId: string,
	boardId: string,
	data: {
		name?: string;
		filePath?: string;
	}
): Promise<boolean> {
	const { orgId } = auth();

	if (!orgId) throw new Error('Not authenticated');

	if (!attachmentId || !data) {
		throw new Error('Invalid data');
	}

	try {
		await prisma.attachment.update({
			where: {
				id: attachmentId,
			},
			data,
		});
	} catch (error) {
		console.error('error:', error);
		return false;
	}

	revalidatePath(`/b/${boardId}`);
	return true;
}
