import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { updateCard } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CardContext } from '.';

interface TaskEditFormProps {
	task: string;
	checked: boolean;
	checklistIndex: number;
	itemIndex: number;
}

export const TaskEditForm = ({
	task,
	checked,
	checklistIndex,
	itemIndex,
}: TaskEditFormProps) => {
	const params = useParams();
	const { cardId, checklist, setChecklist } = useContext(CardContext);
	return (
		<form
			className="w-full space-y-2"
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
						checked,
						isEditing: false,
					};

					const updatedChecklist = checklist.map((checklist, i) => {
						if (i === checklistIndex) {
							return {
								...checklist,
								isEditing: false,
								items: checklist.items.map((item, j) => {
									if (j === itemIndex) {
										return newItem;
									}
									return item;
								}),
							};
						}
						return checklist;
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
			<Textarea name="task" defaultValue={task} autoFocus spellCheck={false} />
			<div className="flex items-center gap-x-2">
				<Button type="submit">Save</Button>
				<Button
					variant="ghost"
					onClick={() =>
						setChecklist(prev => {
							const updatedChecklist = prev.map((checklist, i) => {
								if (i === checklistIndex) {
									return {
										...checklist,
										items: checklist.items.map((item, j) =>
											j === itemIndex ? { ...item, isEditing: false } : item
										),
									};
								}
								return checklist;
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
