'use client';

import { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CreateOrganization, UserButton } from '@clerk/nextjs';
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	PlusIcon,
	Star,
	TrelloIcon,
	UsersRound,
} from 'lucide-react';
import { useOnClickOutside } from 'usehooks-ts';

import { type Board } from '@prisma/client';
import { updateBoard } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Searchbar } from '@/components/searchbar';
import { WorkspaceList } from '@/components/workspace-list';
import { CreateBoard } from '@/components/create-board';
import { useDropdown } from '@/hooks/use-dropdown';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export type MoreMenu = 'none' | 'workspaces' | 'recent' | 'starred';
export type CreateMenu = 'none' | 'board';

interface MoreContextProps {
	currentMoreMenu: MoreMenu;
	setCurrentMoreMenu: (menu: MoreMenu) => void;
}

export const MoreContext = createContext<MoreContextProps>({
	currentMoreMenu: 'none',
	setCurrentMoreMenu: () => {},
});

const menuItems = [
	{ menu: 'workspaces', text: 'Workspaces', class: 'md:hidden' },
	{ menu: 'recent', text: 'Recent boards', class: 'lg:hidden' },
	{ menu: 'starred', text: 'Starred boards', class: 'xl:hidden' },
];

export const Navbar = ({ boards }: { boards: Board[] }) => {
	const {
		isOpen: isOpenMoreDropdown,
		setIsOpen: setIsOpenMoreDropdown,
		currentMenu: currentMoreMenu,
		setCurrentMenu: setCurrentMoreMenu,
		dropdownContentRef: moreDropdownContentRef,
	} = useDropdown<MoreMenu>('none');

	const {
		isOpen: isOpenCreateDropdown,
		setIsOpen: setIsOpenCreateDropdown,
		currentMenu: currentCreateMenu,
		setCurrentMenu: setCurrentCreateMenu,
		dropdownContentRef: createDropdownContentRef,
	} = useDropdown<CreateMenu>('none');

	const starredBoards = boards.filter(
		board => !board.closedAt && board.starred
	);

	const recentBoards = boards
		.filter(board => !board.closedAt)
		.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));

	useOnClickOutside(moreDropdownContentRef, () => {
		setIsOpenMoreDropdown(false);
		setCurrentMoreMenu('none');
	});

	return (
		<header className="w-full h-12 p-2 border-b border-border">
			<nav className="w-full h-full flex justify-between items-center">
				<ul className="w-full h-full flex items-center gap-x-2">
					<li>
						<Link
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'p-0 w-[91px] h-8 box-content'
							)}
							href="/"
						>
							<Image src="/logo.gif" alt="Logo" width={75} height={32} />
						</Link>
					</li>
					{/* workspaces */}
					<li className="hidden md:block">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost">
									<span>Workspaces</span>
									<ChevronDown className="w-4 h-4 ml-1" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-modal">
								<WorkspaceList />
							</DropdownMenuContent>
						</DropdownMenu>
					</li>
					{/* recent boards */}
					<li className="hidden lg:block">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost">
									<span>Recent</span>
									<ChevronDown className="w-4 h-4 ml-1" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-modal">
								<RecentContent recentBoards={recentBoards} />
							</DropdownMenuContent>
						</DropdownMenu>
					</li>
					{/* starred boards */}
					<li className="hidden xl:block">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost">
									<span>Starred</span>
									<ChevronDown className="w-4 h-4 ml-1" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-modal">
								<StarredContent starredBoards={starredBoards} />
							</DropdownMenuContent>
						</DropdownMenu>
					</li>
					{/* more */}
					<li className="xl:hidden">
						<DropdownMenu open={isOpenMoreDropdown}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									onClick={() => setIsOpenMoreDropdown(true)}
								>
									<span>More</span>
									<ChevronDown className="w-4 h-4 ml-1" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-modal"
								ref={moreDropdownContentRef}
							>
								<MoreContext.Provider
									value={{ currentMoreMenu, setCurrentMoreMenu }}
								>
									{currentMoreMenu === 'none' && (
										<>
											{menuItems.map(item => (
												<DropdownMenuItem
													className={`flex justify-between items-center ${item.class} cursor-pointer`}
													key={item.menu}
													onClick={() =>
														setCurrentMoreMenu(item.menu as MoreMenu)
													}
												>
													<span>{item.text}</span>
													<ChevronRight className="w-4 h-4 ml-1" />
												</DropdownMenuItem>
											))}
										</>
									)}
									{currentMoreMenu === 'workspaces' && <WorkspaceList />}
									{currentMoreMenu === 'recent' && (
										<RecentContent recentBoards={recentBoards} />
									)}
									{currentMoreMenu === 'starred' && (
										<StarredContent starredBoards={starredBoards} />
									)}
								</MoreContext.Provider>
							</DropdownMenuContent>
						</DropdownMenu>
					</li>
					{/* create */}
					<li>
						<Dialog>
							<Popover
								onOpenChange={val => !val && setCurrentCreateMenu('none')}
							>
								<PopoverTrigger asChild>
									<Button>
										<span className="hidden xl:block">Create</span>
										<span className="xl:hidden">
											<PlusIcon className="w-5 h-5" />
										</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="p-1 w-modal">
									{currentCreateMenu === 'none' && (
										<>
											<div
												className="relative flex select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer hover:bg-accent"
												onClick={() => setCurrentCreateMenu('board')}
											>
												<TrelloIcon className="w-4 h-4 mr-2" />
												<span>Create Board</span>
											</div>
											<div className="relative flex select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer hover:bg-accent">
												<DialogTrigger className="w-full flex items-center">
													<UsersRound className="w-4 h-4 mr-2" />
													<span>Create Workspace</span>
												</DialogTrigger>
											</div>
										</>
									)}
									{currentCreateMenu === 'board' && <CreateBoard />}
								</PopoverContent>
							</Popover>

							<DialogContent className="p-0 bg-transparent border-none">
								<CreateOrganization />
							</DialogContent>
						</Dialog>
					</li>
				</ul>
				<div className="flex items-center gap-x-2">
					<Searchbar boards={boards} />
					<UserButton />
				</div>
			</nav>
		</header>
	);
};

const RecentContent = ({ recentBoards }: { recentBoards: Board[] }) => {
	const router = useRouter();
	const { currentMoreMenu, setCurrentMoreMenu } = useContext(MoreContext);
	return (
		<>
			<header className="relative h-10 flex justify-center items-center">
				{currentMoreMenu !== 'none' && (
					<Button
						className="absolute top-1 left-1"
						variant="ghost"
						onClick={() => setCurrentMoreMenu('none')}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
				)}

				<h4 className="text-sm font-bold">Recent boards</h4>
			</header>
			<ul>
				{recentBoards.length > 0 ? (
					<li
						className={cn(
							buttonVariants({ variant: 'ghost' }),
							'w-full h-10 flex justify-between items-center cursor-pointer'
						)}
						key={recentBoards[0].id}
						onClick={() => router.push(`/b/${recentBoards[0].id}`)}
					>
						<div className="flex items-center gap-x-2">
							<div className="w-10 h-8">
								<Image
									className="rounded-md"
									src={recentBoards[0].imageThumbUrl}
									width={40}
									height={32}
									alt="thumbnail"
								/>
							</div>
							<span>{recentBoards[0].title}</span>
						</div>
						<div
							className="w-6 h-6 flex justify-center items-center"
							onClick={e => {
								e.stopPropagation();
								updateBoard(recentBoards[0].id, {
									starred: !recentBoards[0].starred,
								});
							}}
						>
							<Star
								className={`w-4 h-4 transition-transform duration-75 ${
									recentBoards[0].starred ? 'fill-primary' : 'hover:scale-125'
								}`}
							/>
						</div>
					</li>
				) : (
					<div className="p-3 text-sm text-muted-foreground">
						No recent boards found.
					</div>
				)}
			</ul>
		</>
	);
};

const StarredContent = ({ starredBoards }: { starredBoards: Board[] }) => {
	const router = useRouter();
	const { currentMoreMenu, setCurrentMoreMenu } = useContext(MoreContext);
	return (
		<>
			<header className="relative h-10 flex justify-center items-center">
				{currentMoreMenu !== 'none' && (
					<Button
						className="absolute top-1 left-1"
						variant="ghost"
						onClick={() => setCurrentMoreMenu('none')}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
				)}
				<h4 className="text-sm font-bold">Starred boards</h4>
			</header>
			<ul>
				{starredBoards.length > 0 ? (
					starredBoards.map(board => (
						<li
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'w-full h-10 flex justify-between items-center cursor-pointer'
							)}
							key={board.id}
							onClick={() => router.push(`/b/${board.id}`)}
						>
							<div className="flex items-center gap-x-2">
								<div className="w-10 h-8">
									<Image
										className="rounded-md"
										src={board.imageThumbUrl}
										width={40}
										height={32}
										alt="thumbnail"
									/>
								</div>
								<span>{board.title}</span>
							</div>
							<div
								className="w-6 h-6 flex justify-center items-center"
								onClick={e => {
									e.stopPropagation();
									updateBoard(board.id, { starred: !board.starred });
								}}
							>
								<Star
									className={`w-4 h-4 transition-transform duration-75 ${
										board.starred ? 'fill-primary' : 'hover:scale-125'
									}`}
								/>
							</div>
						</li>
					))
				) : (
					<div className="p-3 text-sm text-muted-foreground">
						No starred boards found.
					</div>
				)}
			</ul>
		</>
	);
};
