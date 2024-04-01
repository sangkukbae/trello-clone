import { format, isAfter, isTomorrow } from 'date-fns';
import { ChevronDown } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { DatePicker } from './date-picker';

export const Dates = (props: {
	dueDate: Date | null;
	startDate: Date | null;
}) => {
	const [completed, setCompleted] = useState(false);
	return (
		<>
			{props.dueDate && (
				<div className="flex flex-col gap-y-2">
					<Label className="text-xs">Dates</Label>
					<div className="flex items-center gap-x-2">
						<Checkbox
							checked={completed}
							onCheckedChange={(val: boolean) => setCompleted(val)}
						/>
						<DatePicker dueDate={props.dueDate} startDate={props.startDate}>
							<Button className="space-x-2" variant="secondary">
								{props.startDate && (
									<span>{format(props.startDate, 'LLL dd')} - </span>
								)}
								<span>
									{!props.startDate && isTomorrow(props.dueDate) ? (
										<>
											{`tomorrow at  ${format(props.dueDate, 'p')}`}
											<span className="ml-1 px-1 text-xs text-primary-foreground bg-yellow-500 rounded-md">
												Due soon
											</span>
										</>
									) : (
										`${format(props.dueDate, 'LLL dd')} at ${format(
											props.dueDate,
											'p'
										)}`
									)}
								</span>
								{completed ? (
									<span className="px-1 text-xs bg-green-700 rounded-md">
										Completed
									</span>
								) : isAfter(new Date(), props.dueDate) ? (
									<span className="px-1 text-xs bg-red-700 rounded-md">
										Overdue
									</span>
								) : null}
								<ChevronDown className="w-4 h-4" />
							</Button>
						</DatePicker>
					</div>
				</div>
			)}
		</>
	);
};
