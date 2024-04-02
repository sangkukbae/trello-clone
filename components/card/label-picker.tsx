'use client';

import { ReactNode, useContext, useState } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContext } from '.';
import { cn } from '@/lib/utils';
import { updateCard } from '@/app/actions';
import { useParams } from 'next/navigation';

export const LabelPicker = ({ children }: { children: ReactNode }) => {
	const params = useParams();
	const [search, setSearch] = useState('');
	const { labels, setLabels, currentLabel, setCurrentLabel, cardId } =
		useContext(CardContext);

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-modal">
				<header className="relative w-full h-10 flex justify-center items-center">
					{currentLabel && (
						<Button
							className="absolute top-1 left-1"
							variant="ghost"
							onClick={() => setCurrentLabel('')}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
					)}
					<span className="text-sm font-bold">Labels</span>
				</header>
				<form
					className="space-y-2"
					onSubmit={e => {
						e.preventDefault();
						const data = new FormData(e.target as HTMLFormElement);
						const title = data.get('title') as string; // Assuming 'title' is the name of your input field.

						// Directly compute the new labels array for the API call.
						const updatedLabels = labels.map(label => {
							if (label.color === currentLabel) {
								return { ...label, title: title }; // Update the title for the matched label.
							}
							return label; // Return the label unchanged if it doesn't match.
						});

						// Make the API call with the newly computed labels array.
						updateCard({
							cardId,
							boardId: params.boardId as string,
							data: { labels: updatedLabels },
						});

						setCurrentLabel(''); // Reset the current label selection.
					}}
				>
					{currentLabel ? (
						<div className="space-y-2">
							<Label>Title</Label>
							<Input
								name="title"
								defaultValue={
									labels.find(label => label.color === currentLabel)?.title ??
									''
								}
								autoFocus
								spellCheck="false"
							/>
							<Button className="w-full" type="submit">
								Save
							</Button>
						</div>
					) : (
						<>
							<Input
								value={search}
								onChange={e => setSearch(e.target.value)}
								placeholder="Search labels..."
							/>
							{labels
								.filter(
									({ color, title }) =>
										color.includes(search) || title.includes(search)
								)
								.map(({ color, checked }) => (
									<div className="flex items-center gap-x-2" key={color}>
										<Checkbox
											id={color}
											checked={!!checked}
											onCheckedChange={(checked: boolean) => {
												setLabels(prev => {
													const newLabels = prev.map(label => {
														if (label.color === color) {
															return { ...label, checked: checked }; // Update the `checked` status of the matched label.
														}
														return label; // Return other labels unchanged.
													});

													// Make the API call within the state updater function.
													// This ensures we are using the updated labels directly.
													updateCard({
														cardId,
														boardId: params.boardId as string,
														data: { labels: newLabels },
													});

													return newLabels; // Return the new labels array to update the state.
												});
											}}
										/>
										<Label className="w-full cursor-pointer" htmlFor={color}>
											<div
												className={cn(`px-3 h-8 flex items-center rounded-md`, {
													'bg-red-700 hover:bg-red-800': color === 'red',
													'bg-orange-700 hover:bg-orange-800':
														color === 'orange',
													'bg-yellow-700 hover:bg-yellow-800':
														color === 'yellow',
													'bg-green-700 hover:bg-green-800': color === 'green',
													'bg-blue-700 hover:bg-blue-800': color === 'blue',
													'bg-indigo-700 hover:bg-indigo-800':
														color === 'indigo',
													'bg-purple-700 hover:bg-purple-800':
														color === 'purple',
												})}
											>
												{labels.find(label => label.color === color)?.title ??
													''}
											</div>
										</Label>
										<Button
											variant="ghost"
											onClick={() => setCurrentLabel(color)}
										>
											<Pencil className="w-4 h-4" />
										</Button>
									</div>
								))}
						</>
					)}
				</form>
			</PopoverContent>
		</Popover>
	);
};
