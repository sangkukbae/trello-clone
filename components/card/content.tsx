'use client';

import {
	Eye,
	UserRound,
	Paperclip,
	MoveRight,
	Copy,
	Archive,
	Share,
	Tag,
	Clock,
	Wallpaper,
} from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Description } from './description';
import { DatePicker } from './date-picker';
import { Activity } from './activity';
import { SelectCover } from './select-cover';
import { LabelPicker } from './label-picker';
import { Labels } from './labels';
import { ChecklistForm } from './checklist-form';
import { Dates } from './dates';
import { AttachmentForm } from './attachment-form';
import type { CardType } from '@/lib/types';
import { Checklist } from './checklist';
import { Attachment } from './attachment';
import { CardContext } from '.';
import { useContext } from 'react';
import { isChecklist } from '@/lib/utils';
import { copyCard, updateCard } from '@/app/actions';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export const CardContent = (props: CardType) => {
	const params = useParams();
	const { setCurrentLabel } = useContext(CardContext);
	return (
		<div className="grid grid-cols-4 gap-x-4">
			<section className="col-span-4 md:col-span-3 space-y-6">
				<div className="flex flex-wrap gap-2">
					{/* labels */}
					<Labels />
					{/* notifications */}
					{/* <div className="flex flex-col gap-y-2">
						<Label className="text-xs">Notifications</Label>
						<Button className="w-[86px]" variant="secondary">
							<Eye className="w-4 h-4 mr-2" />
							<span>Watch</span>
						</Button>
					</div> */}
					{/* dates */}
					<Dates dueDate={props.dueDate} startDate={props.startDate} />
				</div>
				<Description cardId={props.id} description={props.description} />

				{/* checklist */}
				{isChecklist(props.checklist) &&
					props.checklist.map((item, index) => (
						<Checklist key={index} {...item} index={index} />
					))}

				{/* attachment */}
				<div className="space-y-2">
					<div className="h-8 flex justify-between items-center">
						<span className="text-base">Attachments</span>
						<AttachmentForm>
							<Button variant="secondary">Add</Button>
						</AttachmentForm>
					</div>
					{props.attachments?.length > 0 &&
						props.attachments.map(attachment => (
							<Attachment key={attachment.id} {...attachment} />
						))}
				</div>
				{/* <Activity /> */}
			</section>

			<aside className="col-span-4 md:col-span-1 space-y-2">
				<div className="space-y-2">
					<Label>Add to card</Label>
					<Button className="w-full justify-start" variant="secondary">
						<UserRound className="w-4 h-4 mr-2" />
						<span>Members</span>
					</Button>
					{/* labels button */}
					<LabelPicker>
						<Button
							className="w-full justify-start"
							variant="secondary"
							onClick={() => setCurrentLabel('')}
						>
							<Tag className="w-4 h-4 mr-2" />
							<span>Labels</span>
						</Button>
					</LabelPicker>
					{/* checklist button */}
					<ChecklistForm />
					{/* due date */}
					<DatePicker startDate={props.startDate} dueDate={props.dueDate}>
						<Button className="w-full justify-start" variant="secondary">
							<Clock className="w-4 h-4 mr-2" />
							<span>Dates</span>
						</Button>
					</DatePicker>
					<AttachmentForm>
						<Button className="w-full justify-start" variant="secondary">
							<Paperclip className="w-4 h-4 mr-2" />
							<span>Attachment</span>
						</Button>
					</AttachmentForm>
					{/* cover */}
					<SelectCover coverImgUrl={props.coverImgUrl}>
						<Button className="w-full justify-start" variant="secondary">
							<Wallpaper className="w-4 h-4 mr-2" />
							<span>Cover</span>
						</Button>
					</SelectCover>
				</div>

				<div className="space-y-2">
					<Label>Actions</Label>

					{/* <Button className="w-full justify-start" variant="secondary">
						<MoveRight className="w-4 h-4 mr-2" />
						<span>Move</span>
					</Button> */}
					<Button
						className="w-full justify-start"
						variant="secondary"
						onClick={async () => {
							try {
								const isCopied = await copyCard({
									cardId: props.id,
									boardId: params.boardId as string,
								});

								if (isCopied) {
									toast.success(`Card "${props.title}" copied!`);
								} else {
									toast.error('Failed to copy card');
								}
							} catch (error) {
								console.error('error:', error);
								toast.error('Failed to copy card');
							}
						}}
					>
						<Copy className="w-4 h-4 mr-2" />
						<span>Copy</span>
					</Button>
					<Button
						className="w-full justify-start"
						variant="secondary"
						onClick={async () => {
							const isAchieved = await updateCard({
								cardId: props.id,
								boardId: params.boardId as string,
								data: {
									achievedAt: new Date(),
								},
							});

							if (isAchieved) {
								toast.success(`Card "${props.title}" archived!`);
							} else {
								toast.error('Failed to archive card');
							}
						}}
					>
						<Archive className="w-4 h-4 mr-2" />
						<span>Archive</span>
					</Button>
					{/* <Button className="w-full justify-start" variant="secondary">
						<Share className="w-4 h-4 mr-2" />
						<span>Share</span>
					</Button> */}
				</div>
			</aside>
		</div>
	);
};
