'use client';

import { useContext } from 'react';
import { CheckSquare } from 'lucide-react';

import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContext } from '.';
import { updateCard } from '@/app/actions';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export const ChecklistForm = () => {
	const params = useParams();
	const { checklist, setChecklist } = useContext(CardContext);
	const { cardId } = useContext(CardContext);
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="w-full justify-start" variant="secondary">
					<CheckSquare className="w-4 h-4 mr-2" />
					<span>Checklist</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-modal">
				<header className="flex justify-center items-center">
					<span className="text-sm font-bold">Add checklist</span>
				</header>
				<form
					className="space-y-2"
					onSubmit={async e => {
						e.preventDefault();

						const data = new FormData(e.target as HTMLFormElement);
						const title = data.get('title') as string;

						const updatedChecklist = [
							...checklist,
							{ title, isEditing: false, items: [] },
						];

						try {
							await updateCard({
								cardId,
								boardId: params.boardId as string,
								data: {
									checklist: updatedChecklist,
								},
							});
							setChecklist(updatedChecklist);
						} catch (error) {
							console.error('Failed to update card:', error);
							toast.error('Failed to update card');
						}
					}}
				>
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						name="title"
						defaultValue="Checklist"
						autoFocus
						spellCheck={false}
					/>
					<Button className="w-full" type="submit">
						Add
					</Button>
				</form>
			</PopoverContent>
		</Popover>
	);
};
