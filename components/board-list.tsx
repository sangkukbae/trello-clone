'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { type Board } from '@prisma/client';
import { deleteBoard, updateBoard } from '@/app/actions';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogHeader,
	DialogDescription,
} from '@/components/ui/dialog';
import { CreateBoard } from '@/components/create-board';

type BoardOrder = 'recent' | 'least' | 'a-z' | 'z-a';

export const BoardList = ({ boards }: { boards: Board[] }) => {
	const router = useRouter();
	const [keyword, setKeyword] = useState('');
	const [order, setOrder] = useState<BoardOrder>('recent');

	const closedBoards = boards.filter(board => board.closedAt);

	return (
		<div className="p-8">
			<h2 className="text-xl mb-[30px]">Boards</h2>
			<div className="pt-5 pb-2 w-full flex flex-col md:flex-row justify-between items-center">
				{/* sort by */}
				<div className="w-full md:w-[250px] space-y-2">
					<label
						className="text-xs text-muted-foreground font-bold"
						htmlFor="sortby"
					>
						Sort by
					</label>
					<Select onValueChange={(value: BoardOrder) => setOrder(value)}>
						<SelectTrigger className="w-full" id="sortby">
							<SelectValue placeholder="Most recently active" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem className="px-2" value="recent">
								Most recently active
							</SelectItem>
							<SelectItem className="px-2" value="least">
								Least recently active
							</SelectItem>
							<SelectItem className="px-2" value="a-z">
								Alpapetically A-Z
							</SelectItem>
							<SelectItem className="px-2" value="z-a">
								Alpapetically Z-A
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{/* search */}
				<div className="w-full md:w-[250px] space-y-2">
					<label
						className="text-xs text-muted-foreground font-bold"
						htmlFor="search"
					>
						Search
					</label>
					<Input
						className="w-full"
						id="search"
						type="text"
						placeholder="Search boards"
						onChange={e => setKeyword(e.target.value)}
					/>
				</div>
			</div>
			{/* board list */}
			<ul className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
				<Popover>
					<PopoverTrigger asChild>
						<li className=" w-full">
							<Button className="w-full h-[96px]">Create new board</Button>
						</li>
					</PopoverTrigger>
					<PopoverContent side="right" className="w-modal px-3 py-1">
						<CreateBoard />
					</PopoverContent>
				</Popover>
				{boards
					?.filter(
						board =>
							!board.closedAt && (!keyword || board.title.includes(keyword)) // filter by keyword
					)
					.sort((a, b) => {
						// sort by order
						switch (order) {
							case 'recent':
								return a.createdAt > b.createdAt ? -1 : 1;
							case 'least':
								return a.createdAt < b.createdAt ? -1 : 1;
							case 'a-z':
								return a.title.localeCompare(b.title);
							case 'z-a':
								return b.title.localeCompare(a.title);
							default:
								return 0;
						}
					})
					.map(board => (
						<li className="w-full" key={board.id}>
							<div
								className="group relative p-2 flex flex-col justify-between w-full h-[96px] bg-secondary bg-cover bg-center rounded-md cursor-pointer before:w-full before:h-full before:absolute before:top-0 before:left-0 hover:before:bg-black/10"
								style={{
									backgroundImage: `url(${board.imageThumbUrl})`,
								}}
								onClick={() => router.push(`/b/${board.id}`)}
							>
								<div className="font-bold">{board.title}</div>
								<div className="flex justify-end">
									{board.starred ? (
										<Star
											className="absolute bottom-2 right-2 w-4 h-4 fill-primary cursor-pointer"
											onClick={e => {
												e.stopPropagation();
												updateBoard(board.id, { starred: !board.starred });
											}}
										/>
									) : (
										<span className="relative h-4 opacity-0 w-0 transition-all duration-150 group-hover:w-4 group-hover:opacity-100">
											<Star
												className="w-4 h-4 hover:scale-125 transition-transform duration-75 cursor-pointer"
												onClick={e => {
													e.stopPropagation();
													updateBoard(board.id, { starred: !board.starred });
												}}
											/>
										</span>
									)}
								</div>
							</div>
						</li>
					))}
			</ul>
			{/* view closed board */}
			<div className="pt-5 w-full">
				<Dialog>
					<DialogTrigger asChild>
						{closedBoards?.length > 0 && <Button>View closed boards</Button>}
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>View closed boards</DialogTitle>
						</DialogHeader>
						<div className="max-h-[200px] overflow-y-auto">
							<ul>
								{closedBoards?.length > 0 ? (
									closedBoards.map(board => (
										<li
											className="p-2 w-full flex justify-between items-center border-b border-border"
											key={board.id}
										>
											<Button className="text-sm" variant="link">
												{board.title}
											</Button>
											<div className="flex items-center gap-x-2">
												<Button
													variant="destructive"
													onClick={() => deleteBoard(board.id)}
												>
													<X className="w-4 h-4 mr-1" />
													<span>Delete</span>
												</Button>
												<Button
													onClick={() =>
														updateBoard(board.id, { closedAt: null })
													}
												>
													<span>Reopen</span>
												</Button>
											</div>
										</li>
									))
								) : (
									<DialogDescription>No closed boards found.</DialogDescription>
								)}
							</ul>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};
