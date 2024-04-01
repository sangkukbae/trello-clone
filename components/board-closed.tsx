'use client';

import { updateBoard, deleteBoard } from '@/app/actions';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Board } from '@prisma/client';

export const BoardClosed = ({ board }: { board: Board }) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{board.title} is closed.</CardTitle>
			</CardHeader>
			<CardContent className="flex items-center gap-x-2">
				<Button onClick={() => updateBoard(board.id, { closedAt: null })}>
					Reopen board
				</Button>
				<Button variant="destructive" onClick={() => deleteBoard(board.id)}>
					Permanently delete board
				</Button>
			</CardContent>
		</Card>
	);
};
