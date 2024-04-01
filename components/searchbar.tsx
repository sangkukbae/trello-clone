'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOnClickOutside, useEventListener } from 'usehooks-ts';

import { type Board } from '@prisma/client';
import { Input } from '@/components/ui/input';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command';
import { Separator } from './ui/separator';

export const Searchbar = ({ boards }: { boards: Board[] }) => {
	const router = useRouter();
	const [focused, setFocused] = useState(false);
	const [search, setSearch] = useState('');
	const commandRef = useRef(null);

	const resetSearch = () => {
		setFocused(false);
		setSearch('');
	};

	useOnClickOutside(commandRef, resetSearch);

	useEventListener('keydown', e => {
		if (e.metaKey && e.key === '/') {
			e.preventDefault();
			setFocused(true);
		}
		if (e.key === 'Escape') {
			resetSearch();
		}
	});

	const recentBoards = boards
		.filter(board => !board.closedAt)
		.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));

	const filteredBoards =
		boards.length > 0 && search.trim().length > 0
			? boards.filter(
					board =>
						!board.closedAt &&
						board.id !== recentBoards[0].id &&
						board.title.includes(search)
			  )
			: [];

	return (
		<div className="relative">
			<div className="hidden lg:block absolute top-0 right-0 border z-[99999] rounded-md">
				{focused && (
					<Command className="w-[784px]" ref={commandRef} shouldFilter={false}>
						<CommandInput
							className="h-8"
							placeholder="Search Trello"
							autoFocus
							value={search}
							onValueChange={setSearch}
						/>
						<CommandList>
							<CommandGroup heading="RECENT BOARDS">
								{recentBoards.length > 0 && (
									<CommandItem
										className="w-full h-full flex items-center gap-x-2 cursor-pointer"
										onSelect={() => router.push(`/b/${recentBoards[0]?.id}`)}
										key={recentBoards[0]?.id}
									>
										<span className="flex justify-center w-6 h-6">
											<Image
												className="rounded-md"
												src={recentBoards[0]?.imageThumbUrl}
												width={24}
												height={24}
												alt="thumbnail"
											/>
										</span>
										<span>{recentBoards[0]?.title}</span>
									</CommandItem>
								)}
							</CommandGroup>
							{search && (
								<>
									<Separator />
									{filteredBoards.length > 0 ? (
										<>
											<CommandGroup>
												{filteredBoards.map(board => (
													<CommandItem
														className="flex items-center gap-x-2 cursor-pointer"
														onSelect={() => router.push(`/b/${board.id}`)}
														key={board.id}
													>
														<span className="flex justify-center w-6 h-6">
															<Image
																className="rounded-md"
																src={board.imageThumbUrl}
																width={24}
																height={24}
																alt="thumbnail"
															/>
														</span>
														<span>{board.title}</span>
													</CommandItem>
												))}
											</CommandGroup>
										</>
									) : (
										<div className="py-6 text-center text-sm text-muted-foreground rounded-md">
											No results found.
										</div>
									)}
								</>
							)}
						</CommandList>
					</Command>
				)}
			</div>

			<Input
				className="hidden lg:block w-[200px] h-8 focus-visible:ring-0 focus-visible:ring-transparent"
				onFocus={() => setFocused(true)}
				placeholder="Search"
			/>
		</div>
	);
};
