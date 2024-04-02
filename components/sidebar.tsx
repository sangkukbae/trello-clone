'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useOrganization } from '@clerk/clerk-react';
import {
	ChevronLeft,
	MoreHorizontal,
	PlusIcon,
	Star,
	TrelloIcon,
} from 'lucide-react';

import { type Board } from '@prisma/client';
import { updateBoard } from '@/app/actions';
import { useSidebarStore } from '@/store';
import { cn } from '@/lib/utils';

import { Separator } from '@/components/ui/separator';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { CreateBoard } from '@/components/create-board';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';

interface SidebarProps {
	boards: Board[];
}

type Order = 'alphabet' | 'recent';

export const Sidebar = (props: SidebarProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const { organization, isLoaded } = useOrganization();
	const { isSidebarExpanded, toggleSidebar } = useSidebarStore();

	const [settingsPopoverOpen, setSettingsPopoverOpen] =
		useState<Record<string, boolean>>();
	const [order, setOrder] = useState<Order>('alphabet');

	const handleSidebar = () => {
		if (window.innerWidth < 768) {
			toggleSidebar(false);
		} else {
			// toggleSidebar(true);
		}
	};

	useEffect(() => {
		window.addEventListener('resize', () => handleSidebar());

		return () => handleSidebar();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className={cn(
				'relative w-[260px] h-[100%-3rem] border-r border-border transition-all duration-200 ease-in-out',
				{
					'w-0': !isSidebarExpanded,
				}
			)}
		>
			<div
				className={cn(
					'absolute top-0 left-0 w-full h-full transition-all duration-200 ease-in-out',
					{
						'translate-x-[-260px]': !isSidebarExpanded,
					}
				)}
			>
				{/* current workspace */}
				{!isLoaded ? (
					<div className="px-2 py-2 flex flex-col md:flex-row justify-between space-y-2">
						<div className="w-full flex items-center gap-x-2">
							<Skeleton className="w-[32px] h-[32px] rounded-sm overflow-hidden" />
							<div className="w-full flex flex-col gap-y-2">
								<Skeleton className="w-[160px] h-5" />
								<Skeleton className="w-[60px] h-5" />
							</div>
						</div>
					</div>
				) : (
					<div className="px-3 py-2 flex justify-between items-center">
						<div className="flex items-center gap-x-2">
							<div className="w-8 h-8 rounded-sm overflow-hidden">
								<Image
									src={organization?.imageUrl ?? ''}
									width={32}
									height={32}
									alt="logo"
								/>
							</div>
							<div className="flex flex-col">
								<div className="max-w-[160px] text-sm font-bold truncate">
									{organization?.name}
								</div>
								<div className="text-xs text-gray-500">Free</div>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => toggleSidebar(!isSidebarExpanded)}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
					</div>
				)}
				<Separator />
				<ul>
					{/* board */}
					<li>
						<Link
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'pl-3 w-full justify-start rounded-none',
								{ 'bg-white/20': pathname === `/w/${organization?.id}` }
							)}
							href={`/w/${organization?.id}`}
						>
							<TrelloIcon className="w-4 h-4 mr-2" />
							<span>Boards</span>
						</Link>
					</li>
				</ul>
				{/* my boards */}
				<div className="group pl-3 pr-2 py-1 w-full h-8 flex justify-between items-center">
					<span className="text-sm font-bold">Your boards</span>
					<div className="flex items-center gap-x-3">
						<Popover
							onOpenChange={value =>
								setSettingsPopoverOpen(prev => ({ ...prev, 'my-board': value }))
							}
						>
							<PopoverTrigger asChild>
								<Button
									className={cn(
										'invisible w-6 h-6 hover:bg-white/20 group-hover:visible',
										{ 'visible bg-white/20': settingsPopoverOpen?.['my-board'] }
									)}
									variant="ghost"
									size="icon"
									onClick={e => e.stopPropagation()}
								>
									<MoreHorizontal className="w-4 h-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-modal px-3 py-1" side="right">
								<header className="w-full h-10 flex justify-center items-center">
									<h4 className="text-sm font-bold">Your boards</h4>
								</header>
								<div className="space-y-2">
									<label
										className="text-xs text-muted-foreground font-bold"
										htmlFor="sortby"
									>
										Sort
									</label>
									<Select onValueChange={(value: Order) => setOrder(value)}>
										<SelectTrigger className="w-full" id="sortby">
											<SelectValue placeholder="Sort alphabetically" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem className="px-2" value="alphabet">
												Sort alphabetically
											</SelectItem>
											<SelectItem className="px-2" value="recent">
												Sort by most recent
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</PopoverContent>
						</Popover>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									className="w-6 h-6 hover:bg-white/20"
									variant="ghost"
									size="icon"
									onClick={e => e.stopPropagation()}
								>
									<PlusIcon className="w-4 h-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent side="right" className="w-modal px-3 py-1">
								<CreateBoard />
							</PopoverContent>
						</Popover>
					</div>
				</div>
				<ul>
					{props.boards
						.filter(board => !board.closedAt)
						.sort((a, b) => {
							// Compare starred status (starred ones come first)
							if (a.starred !== b.starred) {
								return a.starred ? -1 : 1;
							}

							// For boards with the same starred status, sort by 'order'
							return order === 'alphabet'
								? a.title.localeCompare(b.title) // Alphabetically
								: new Date(b.createdAt).getTime() -
										new Date(a.createdAt).getTime(); // By creation time, newest first
						})
						.map(board => (
							<li key={board.id}>
								<Popover
									onOpenChange={value =>
										setSettingsPopoverOpen(prev => ({
											...prev,
											[board.id]: value,
										}))
									}
								>
									<div
										className={cn(
											buttonVariants({ variant: 'ghost' }),
											'group pl-3 w-full justify-between rounded-none cursor-pointer',
											{
												'bg-white/20': pathname === `/b/${board.id}`,
											}
										)}
										onClick={() => router.push(`/b/${board.id}`)}
									>
										<div className="flex">
											<span
												className="mr-2 w-8 h-5 bg-primary rounded-md bg-cover bg-center bg-no-repeat"
												style={{
													backgroundImage: `url(${board.imageThumbUrl})`,
												}}
											></span>
											<span className="max-w-[140px] truncate">
												{board.title}
											</span>
										</div>
										<div className="flex items-center gap-x-3">
											<PopoverTrigger className="group" asChild>
												<Button
													className={cn(
														'invisible w-6 h-6 hover:bg-white/20 group-hover:visible',
														{
															'visible bg-white/20':
																settingsPopoverOpen?.[board.id],
														}
													)}
													variant="ghost"
													size="icon"
													onClick={e => e.stopPropagation()}
												>
													<MoreHorizontal className="w-4 h-4" />
												</Button>
											</PopoverTrigger>
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
										</div>
									</div>

									<PopoverContent>
										<header className="w-full h-10 flex justify-center items-center">
											<h4 className="text-sm font-bold">Close board</h4>
										</header>
										<Button
											variant="destructive"
											className="w-full"
											onClick={async () => {
												const isClosed = await updateBoard(board.id, {
													closedAt: new Date(),
												});

												if (isClosed) {
													toast.success(`"${board.title}" has been closed`);
												} else {
													toast.error('Failed to close board');
												}
											}}
										>
											Close
										</Button>
									</PopoverContent>
								</Popover>
							</li>
						))}
				</ul>
			</div>
			<div
				className={cn(
					'absolute top-0 left-0 z-[99999] w-4 h-full bg-border transition-transform duration-100 cursor-pointer hover:bg-primary/20',
					{ '-translate-x-4': isSidebarExpanded }
				)}
				onClick={() => toggleSidebar(!isSidebarExpanded)}
			></div>
		</div>
	);
};
