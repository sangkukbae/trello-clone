'use client';

import { ReactNode, useContext, useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { updateCard } from '@/app/actions';
import { CardContext } from '.';
import { useParams } from 'next/navigation';

export const DatePicker = (props: {
	startDate: Date | null;
	dueDate: Date | null;
	children: ReactNode;
}) => {
	const params = useParams();
	const { cardId } = useContext(CardContext);

	const [startDate, setStartDate] = useState<Date | undefined>(
		props.startDate || undefined
	);
	const [startDateInput, setStartDateInput] = useState(
		props.startDate ? format(props.startDate, 'MM/dd/yyyy') : ''
	);
	const [dueDate, setDueDate] = useState<Date | undefined>(
		props.dueDate || new Date()
	);
	const [dueDateInput, setDueDateInput] = useState(
		props.dueDate ? format(props.dueDate, 'MM/dd/yyyy') : ''
	);
	const [dueDateChecked, setDueDateChecked] = useState(props.dueDate !== null);
	const [startDateChecked, setStartDateChecked] = useState(
		props.startDate !== null
	);
	const [dueDateTimeInput, setDueDateTimeInput] = useState(
		props.dueDate ? format(props.dueDate, 'p') : ''
	);

	return (
		<Popover>
			<PopoverTrigger asChild>{props.children}</PopoverTrigger>
			<PopoverContent side="left" className="w-modal space-y-2">
				<header className="flex justify-center items-center">
					<span className="text-sm font-bold">Dates</span>
				</header>
				{startDateChecked ? (
					<Calendar
						mode="range"
						locale={ko}
						selected={{ from: startDate, to: dueDate }}
						onSelect={date => {
							if (!date) return;

							const { from, to } = date;

							setStartDate(from);
							setDueDate(to);
							setDueDateChecked(true);

							setStartDateInput(from ? format(from, 'MM/dd/yyyy') : '');
							setDueDateInput(to ? format(to, 'MM/dd/yyyy') : '');
						}}
					/>
				) : (
					<Calendar
						mode="single"
						locale={ko}
						selected={dueDate}
						onSelect={date => {
							if (!date) return;
							setDueDate(date);
							setDueDateChecked(true);

							if (date) {
								setDueDateInput(format(date, 'MM/dd/yyyy'));
							} else {
								setDueDateInput('');
							}
						}}
					/>
				)}

				<div>
					<Label>Start date</Label>
					<div className="flex items-center gap-x-2">
						<Checkbox
							id="startDate"
							checked={startDateChecked}
							onCheckedChange={(checked: boolean) => {
								setStartDateChecked(checked);
								setStartDate(undefined);
							}}
						/>
						<Input
							value={startDateInput}
							onChange={e => {
								setStartDateInput(e.currentTarget.value);
								const date = parse(
									e.currentTarget.value,
									'MM/dd/yyyy',
									new Date()
								);
								if (isValid(date)) {
									setStartDate(date);
								} else {
									setStartDate(undefined);
								}
							}}
							onFocus={() => setDueDateChecked(true)}
							onBlur={e => {
								if (!e.currentTarget.value) {
									setDueDateChecked(false);
								}

								const date = parse(
									e.currentTarget.value,
									'MM/dd/yyyy',
									new Date()
								);
								if (isValid(date)) {
									setDueDate(date);
									console.log('date:', date);
								} else {
									setDueDate(undefined);
								}
							}}
							placeholder="M/D/YYYY"
						/>
					</div>
				</div>
				<div>
					<Label>Due date</Label>
					<div className="flex items-center gap-x-2">
						<Checkbox
							id="dueDate"
							checked={dueDateChecked}
							onCheckedChange={(checked: boolean) => {
								setDueDateChecked(checked);
								if (checked) {
									setDueDate(new Date());
									setDueDateInput(format(new Date(), 'MM/dd/yyyy'));
									setDueDateTimeInput(format(new Date(), 'p'));
								} else {
									setDueDate(undefined);
									setDueDateInput('');
									setDueDateTimeInput('');
								}
							}}
						/>
						<Input
							value={dueDateInput}
							onChange={e => setDueDateInput(e.currentTarget.value)}
							onFocus={() => setDueDateChecked(true)}
							onBlur={e => {
								const date = parse(
									e.currentTarget.value,
									'MM/dd/yyyy',
									new Date()
								);
								if (isValid(date)) {
									setDueDate(date);
								} else {
									setDueDateInput(format(new Date(), 'MM/dd/yyyy'));
									setDueDate(new Date());
								}
							}}
							placeholder="M/D/YYYY"
						/>
						<Input
							value={dueDateTimeInput}
							onChange={e => setDueDateTimeInput(e.currentTarget.value)}
							onBlur={e => {
								const datetime = parse(e.currentTarget.value, 'p', new Date());
								if (isValid(datetime)) {
									setDueDateTimeInput(e.target.value);
								} else {
									setDueDateTimeInput(format(new Date(), 'p'));
								}
							}}
							placeholder="h:mm A"
						/>
					</div>
				</div>
				<Button
					className="w-full"
					onClick={() => {
						if (dueDate && dueDateTimeInput) {
							const time = parse(dueDateTimeInput, 'p', new Date());
							if (isValid(time)) {
								dueDate.setHours(time.getHours());
								dueDate.setMinutes(time.getMinutes());
							}
						}
						updateCard({
							cardId,
							boardId: params.boardId as string,
							data: { startDate: startDate || null, dueDate: dueDate || null },
						});
					}}
				>
					Save
				</Button>
				<Button
					className="w-full"
					variant="secondary"
					onClick={() => {
						updateCard({
							cardId,
							boardId: params.boardId as string,
							data: { startDate: null, dueDate: null },
						});

						setStartDate(undefined);
						setStartDateInput('');
						setDueDate(undefined);
						setDueDateInput('');
						setDueDateChecked(false);
						setStartDateChecked(false);
					}}
				>
					Remove
				</Button>
			</PopoverContent>
		</Popover>
	);
};
