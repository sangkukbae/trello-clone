import { updateCard } from '@/app/actions';
import { ChecklistItem as ChecklistItemType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useContext } from 'react';
import { CardContext } from '.';
import { useParams } from 'next/navigation';
import { TaskEditForm } from './task-edit-form';

interface ChecklistItemProps extends ChecklistItemType {
	items: ChecklistItemType[];
	itemIndex: number;
	checklistIndex: number;
}

export const ChecklistItem = ({
	task,
	checked,
	isEditing,
	items,
	itemIndex,
	checklistIndex,
}: ChecklistItemProps) => {
	const params = useParams();
	const { cardId, checklist, setChecklist } = useContext(CardContext);

	return (
		<li key={itemIndex} className="flex items-center gap-x-2">
			<Checkbox
				className={cn({ 'self-start': isEditing })}
				checked={checked}
				onCheckedChange={async () => {
					// Directly construct the updated items array.
					const updatedItems = items.map((item, i) =>
						i === itemIndex ? { ...item, checked: !item.checked } : item
					);

					// Construct the updated checklist with the new items array.
					const updatedChecklist = checklist.map((item, i) => {
						if (i === checklistIndex) {
							return { ...item, items: updatedItems };
						}
						return item;
					});
					try {
						// Await the update operation to ensure state is consistent with the backend.
						await updateCard({
							cardId,
							boardId: params.boardId as string,
							data: { checklist: updatedChecklist },
						});

						// Update the local state only after successful backend update.
						setChecklist(updatedChecklist);
					} catch (error) {
						console.error('Failed to update card:', error);
						toast.error('Failed to update card');
					}
				}}
			/>
			{isEditing ? (
				<TaskEditForm
					task={task}
					checked={checked}
					checklistIndex={checklistIndex}
					itemIndex={itemIndex}
				/>
			) : (
				<Button
					className="w-full justify-start"
					variant="ghost"
					onClick={() =>
						setChecklist(prev => {
							const updatedChecklist = prev.map((checklist, i) => {
								if (i === checklistIndex) {
									return {
										...checklist,
										items: checklist.items.map((item, j) =>
											j === itemIndex ? { ...item, isEditing: true } : item
										),
									};
								}
								return checklist;
							});
							return updatedChecklist;
						})
					}
				>
					{task}
				</Button>
			)}
		</li>
	);
};
