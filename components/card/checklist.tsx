'use client';

import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { updateCard } from '@/app/actions';
import { CardContext } from '.';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { type Checklist as ChecklistProps } from '@/lib/types';
import { ChecklistItem } from './checklist-item';
import { TaskAddForm } from './task-add-form';

export const Checklist = (props: ChecklistProps & { index: number }) => {
	const params = useParams();
	const { cardId, checklist, setChecklist } = useContext(CardContext);

	return (
		<>
			{props.title.length > 0 && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<span className="text-base">{props.title}</span>
						<Button
							variant="secondary"
							onClick={async () => {
								try {
									await updateCard({
										cardId,
										boardId: params.boardId as string,
										data: {
											checklist: checklist.filter((_, i) => i !== props.index),
										},
									});
									setChecklist(prev =>
										prev.filter((_, i) => i !== props.index)
									);
								} catch (error) {
									console.error('Failed to update card:', error);
									toast.error('Failed to update card');
								}
							}}
						>
							Delete
						</Button>
					</div>
					<Progress
						className="h-2"
						value={
							(props.items.filter(item => item.checked).length /
								props.items.length) *
							100
						}
					/>
					{/* checklist items */}
					<ul className="space-y-2">
						{checklist[props.index]?.items.map((item, index) => (
							<ChecklistItem
								key={index}
								{...item}
								items={props.items}
								checklistIndex={props.index}
								itemIndex={index}
							/>
						))}
					</ul>
					{checklist[props.index]?.isEditing ?? false ? (
						<TaskAddForm checklistIndex={props.index} />
					) : (
						<Button
							variant="secondary"
							onClick={() =>
								setChecklist(prev => {
									const updatedChecklist = prev.map((item, i) => {
										if (i === props.index) {
											return { ...item, isEditing: true };
										}
										return item;
									});
									return updatedChecklist;
								})
							}
						>
							Add an item
						</Button>
					)}
				</div>
			)}
		</>
	);
};
