import { notFound } from 'next/navigation';

import { getBoard } from '@/app/actions';
import type { Board, List as ListModel } from '@prisma/client';
import { Toolbar } from '@/components/toolbar';
import { ListContainer } from '@/components/list-container';
import { BoardClosed } from '@/components/board-closed';
import { CardType } from '@/lib/types';

export default async function BoardPage({
	params,
}: {
	params: { boardId: string };
}) {
	const { boardId } = params;
	const board = (await getBoard(boardId)) as
		| (Board & {
				lists: (ListModel & {
					cards: CardType[];
				})[];
		  })
		| null;

	if (!board) notFound();

	return (
		<div
			className="w-full h-full flex flex-col flex-1 overflow-y-auto"
			style={{
				background: `url(${board.imageFullUrl}) no-repeat center center / cover`,
			}}
		>
			{board.closedAt ? (
				<div className="w-full h-full flex justify-center items-center backdrop-blur-sm ">
					<BoardClosed board={board} />
				</div>
			) : (
				<>
					{/* toolbar */}
					<Toolbar board={board} />
					<div className="relative grow">
						<div className="absolute inset-0 overflow-x-auto p-3 flex gap-x-2">
							<ListContainer board={board} />
						</div>
					</div>
				</>
			)}
		</div>
	);
}
