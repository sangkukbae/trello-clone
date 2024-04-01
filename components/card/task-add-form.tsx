import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { updateCard } from '@/app/actions';
import { CardContext } from '.';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const TaskAddForm = ({ checklistIndex }: { checklistIndex: number }) => {
	const params = useParams();
	const { cardId, checklist, setChecklist } = useContext(CardContext);
	return (
		<form
			className="space-y-2"
			onSubmit={async e => {
				e.preventDefault();

				// Directly access 'task' from FormData
				const formData = new FormData(e.target as HTMLFormElement);
				const task = formData.get('task') as string;

				// Check for non-empty task directly
				if (typeof task === 'string' && task.trim()) {
					// Construct the new item object
					const newItem = {
						task: task.trim(),
						checked: false,
						isEditing: false,
					};

					const updatedChecklist = checklist.map((item, i) => {
						if (i === checklistIndex) {
							return {
								...item,
								isEditing: false,
								items: [...item.items, newItem],
							};
						}
						return item;
					});

					// Now, perform the API call to update the backend
					try {
						await updateCard({
							cardId,
							boardId: params.boardId as string,
							data: {
								checklist: updatedChecklist,
							},
						});

						// Update the checklist state
						setChecklist(updatedChecklist);
					} catch (error) {
						console.error('Failed to update the card:', error);
						toast.error('Failed to update card');
					}
				}
			}}
		>
			<Textarea
				name="task"
				placeholder="Add an item"
				autoFocus
				spellCheck={false}
			/>
			<div className="flex items-center gap-x-2">
				<Button type="submit">Add</Button>
				<Button
					variant="ghost"
					onClick={() =>
						setChecklist(prev => {
							const updatedChecklist = prev.map((item, i) => {
								if (i === checklistIndex) {
									return { ...item, isEditing: false };
								}
								return item;
							});
							return updatedChecklist;
						})
					}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
};
