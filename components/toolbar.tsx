'use client';

import { useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { Star, UserRoundPlus, Sheet, MoreHorizontal } from 'lucide-react';

import { type Board } from '@prisma/client';
import { updateBoard } from '@/app/actions';
import { cn } from '@/lib/utils';
import { buttonVariants, Button } from '@/components/ui/button';
import {
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { InviteForm } from '@/components/invite-form';
import { Input } from '@/components/ui/input';

export const Toolbar = ({ board }: { board: Board }) => {
	const [title, setTitle] = useState(board.title);
	const [isEditing, setIsEditing] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);

	useOnClickOutside(inputRef, () => {
		setIsEditing(false);
	});

	return (
		<div className="relative px-4 py-3 w-full h-14 flex justify-between items-center backdrop-blur-sm">
			<div className="flex items-center gap-x-1">
				{isEditing ? (
					<form
						onSubmit={e => {
							e.preventDefault();
							updateBoard(board.id, { title });
							setIsEditing(false);
						}}
					>
						<Input
							className="px-1 py-2 text-lg font-bold"
							ref={inputRef}
							value={title}
							onChange={e => setTitle(e.target.value)}
							autoFocus
						/>
					</form>
				) : (
					<div
						className={cn(
							buttonVariants({ variant: 'ghost' }),
							'px-2 h-8 text-lg font-bold cursor-pointer'
						)}
						onClick={() => setIsEditing(true)}
					>
						{board?.title}
					</div>
				)}

				<Button
					variant="ghost"
					onClick={() =>
						updateBoard(board.id, {
							starred: !board.starred,
						})
					}
				>
					<Star
						className={cn(
							'w-4 h-4 hover:scale-125 transition-transform duration-100',
							{
								'fill-primary hover:scale-100': board.starred,
							}
						)}
					/>
				</Button>
			</div>
			<div className="flex items-center gap-x-1">
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<UserRoundPlus className="w-4 h-4 mr-2" />
							<span>Share</span>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Invite to Workspace</DialogTitle>
						</DialogHeader>
						<InviteForm />
					</DialogContent>
				</Dialog>
				{/* <Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="w-4 h-4" />
						</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Are you absolutely sure?</SheetTitle>
							<SheetDescription>
								This action cannot be undone. This will permanently delete your
								account and remove your data from our servers.
							</SheetDescription>
						</SheetHeader>
					</SheetContent>
				</Sheet> */}
			</div>
		</div>
	);
};
