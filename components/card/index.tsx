'use client';

import {
	Dispatch,
	SetStateAction,
	createContext,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { Clock, Wallpaper, Text, Paperclip, CheckSquare } from 'lucide-react';

import type { List } from '@prisma/client';
import { cn } from '@/lib/utils';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogHeader,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { CardContent } from '@/components/card/content';
import type { CardType, Checklist, ImageInfo, Label } from '@/lib/types';
import {
	BUCKET_NAME,
	colorClasses,
	defaultColorList,
	defaultImageList,
} from '@/lib/constants';
import { createAttachment, updateCard } from '@/app/actions';
import { useParams } from 'next/navigation';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { useOnClickOutside } from 'usehooks-ts';
import { SelectCover } from './select-cover';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, isAfter, isTomorrow } from 'date-fns';
import { isChecklist, isLabel } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

interface CardContextProps {
	cardId: string;
	cover: string;
	coverImgUrl: string | null;
	setCover: Dispatch<SetStateAction<string>>;
	labels: Label[];
	setLabels: Dispatch<SetStateAction<Label[]>>;
	currentLabel: string;
	setCurrentLabel: Dispatch<SetStateAction<string>>;
	checklist: Checklist[];
	setChecklist: Dispatch<SetStateAction<Checklist[]>>;
	tempImgInfo?: ImageInfo;
	setTempImgInfo?: (imgInfo: ImageInfo) => void;
}

export const initialChecklist = [
	{
		title: '',
		isEditing: false,
		items: [],
	},
];

export const CardContext = createContext<CardContextProps>({
	cover: '',
	setCover: () => {},
	coverImgUrl: null,
	labels: [],
	setLabels: () => {},
	currentLabel: '',
	setCurrentLabel: () => {},
	cardId: '',
	checklist: initialChecklist,
	setChecklist: () => {},
	tempImgInfo: undefined,
	setTempImgInfo: () => {},
});

const initialLabels = [
	{ title: '', color: 'red', checked: false },
	{ title: '', color: 'orange', checked: false },
	{ title: '', color: 'yellow', checked: false },
	{ title: '', color: 'green', checked: false },
	{ title: '', color: 'blue', checked: false },
	{ title: '', color: 'indigo', checked: false },
	{ title: '', color: 'purple', checked: false },
];

export const CardContainer = ({
	provided,
	card,
	list,
}: {
	provided: any;
	card: CardType;
	list: List;
}) => {
	const { user } = useUser();
	const params = useParams();
	const [cover, setCover] = useState<string>('');
	const [labels, setLabels] = useState(card.labels || initialLabels);
	const [currentLabel, setCurrentLabel] = useState('');
	const [checklist, setChecklist] = useState(card.checklist || []);
	const [tempImgInfo, setTempImgInfo] = useState<ImageInfo | undefined>(
		undefined
	);
	const [isEditingTitle, setIsEditingTitle] = useState(false);

	const formRef = useRef<HTMLFormElement>(null);

	const uploadFile = async (filePath: string, file: File) => {
		const { data, error } = await supabase.storage
			.from(BUCKET_NAME)
			.upload(filePath, file);

		if (error) throw new Error(error.message);

		if (data) {
			console.log('data:', data);
			await createAttachment(params.boardId as string, {
				cardId: card.id,
				name: file.name,
				filePath,
			});

			toast.success(`File "${file.name}" uploaded successfully`);
		} else {
			toast.error(`Failed to upload file "${file.name}"`);
		}
	};

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles?.[0];
		if (!file) return;

		const filePath = `${user?.id}/${params.boardId}/${file.name}`;
		uploadFile(filePath, file);
	}, []);

	const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
		onDrop,
	});
	console.log('isFocused:', isFocused);

	useOnClickOutside(formRef, () => setIsEditingTitle(false));

	useEffect(() => {
		setLabels(card.labels || initialLabels);
	}, [card.labels]);

	useEffect(() => {
		const updateCoverImgUrl = async () => {
			const src = getCoverImg(cover);

			if (!src) return;

			try {
				updateCard({
					cardId: card.id,
					boardId: params.boardId as string,
					data: {
						coverImgUrl: src,
					},
				});
			} catch (error) {
				console.error(`Failed to update card cover: ${error}`);
			}
		};

		updateCoverImgUrl();
	}, [cover]);

	const getCoverImg = (cover: string) => {
		let src;
		if (defaultColorList.includes(cover)) {
			src = `/board-background/${cover}.svg`;
		} else {
			const image = defaultImageList.find(img => img.id === cover);
			if (image) {
				src = image.urls.regular || defaultImageList[0].urls.regular;
			} else {
				src = tempImgInfo?.imageFullUrl;
			}
		}

		return src;
	};

	return (
		<CardContext.Provider
			value={{
				cover,
				setCover,
				coverImgUrl: card.coverImgUrl,
				currentLabel,
				setCurrentLabel,
				cardId: card.id,
				// @ts-ignore
				checklist,
				// @ts-ignore
				setChecklist,
				// @ts-ignore
				labels,
				// @ts-ignore
				setLabels,
				tempImgInfo,
				setTempImgInfo,
			}}
		>
			<Dialog>
				<DialogTrigger asChild>
					<li
						className={cn(
							buttonVariants({ variant: 'secondary' }),
							'w-full min-h-10 h-auto flex-col gap-y-2 '
						)}
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
					>
						{isLabel(card.labels) && (
							<div className="w-full h-2 flex items-center gap-x-1">
								{card.labels
									.filter(l => l.checked)
									.map(l => (
										<Tooltip key={l.color}>
											<TooltipTrigger asChild>
												<span
													className={cn(
														'min-w-10 w-fit h-2 rounded-md',
														colorClasses[l.color]
													)}
												></span>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													color: {l.color} {l.title && `, title: ${l.title}`}
												</p>
											</TooltipContent>
										</Tooltip>
									))}
							</div>
						)}
						<div className="self-start max-w-full truncate">{card.title}</div>
						{(card.dueDate ||
							card.description ||
							card.attachments.length > 0 ||
							card.checklist) && (
							<div className="self-start flex items-center gap-x-2 ">
								{card.dueDate && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div
												className={cn(
													'self-start w-fit px-2 py-1 flex justify-start items-center rounded-md transition-colors hover:bg-primary/20',
													{
														'bg-red-700': isAfter(new Date(), card.dueDate),
														'text-primary-foreground bg-yellow-500 hover:bg-yellow-600':
															isTomorrow(card.dueDate),
													}
												)}
											>
												<Clock className="w-4 h-4 mr-2" />
												<span className="text-xs">
													{card.startDate
														? `${format(card.startDate, 'LLL dd')} - ${format(
																card.dueDate,
																'LLL dd'
														  )}`
														: `${format(card.dueDate, 'LLL dd')}`}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												{isAfter(new Date(), card.dueDate)
													? 'this card is past due'
													: isTomorrow(card.dueDate)
													? 'this card is due in less than 24 hours.'
													: 'this card is due later.'}
											</p>
										</TooltipContent>
									</Tooltip>
								)}
								{card.description && (
									<Tooltip>
										<TooltipTrigger asChild>
											<Text className="w-4 h-4" />
										</TooltipTrigger>
										<TooltipContent>
											<p>this card has a description.</p>
										</TooltipContent>
									</Tooltip>
								)}
								{card?.attachments?.length > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center">
												<Paperclip className="w-4 h-4 mr-1" />
												<span>{card.attachments.length}</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>Attachment</p>
										</TooltipContent>
									</Tooltip>
								)}
								{isChecklist(card.checklist) && card.checklist.length > 0 && (
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center">
												<CheckSquare className="w-4 h-4 mr-1" />
												<span>
													{card.checklist.reduce(
														(acc, cur) =>
															acc + cur.items.filter(i => i.checked).length,
														0
													)}
													/
													{card.checklist.reduce(
														(acc, cur) => acc + cur.items.length,
														0
													)}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>Checklist items</p>
										</TooltipContent>
									</Tooltip>
								)}
							</div>
						)}
					</li>
				</DialogTrigger>
				<DialogContent
					className="p-0 max-w-[768px] max-h-full overflow-y-auto"
					{...getRootProps({ onClick: e => e.stopPropagation() })}
				>
					<input {...getInputProps()} />
					{isDragActive ? (
						<div className="w-full h-[586px] flex justify-center items-center">
							<p className="text-xl font-bold">Drop file to upload</p>
						</div>
					) : (
						<>
							<DialogHeader>
								<div
									className={cn('hidden relative', {
										'block h-[160px] ': !!cover || !!card.coverImgUrl,
									})}
									style={{
										background: cover
											? `url(${getCoverImg(
													cover
											  )}) no-repeat center center / cover`
											: card.coverImgUrl
											? `url(${card.coverImgUrl}) no-repeat center center / cover`
											: 'none',
									}}
								>
									<SelectCover coverImgUrl={card.coverImgUrl}>
										<Button
											className="absolute bottom-4 right-4"
											variant="ghost"
										>
											<Wallpaper className="w-4 h-4 mr-2" />
											<span>Cover</span>
										</Button>
									</SelectCover>
								</div>
								<div className="p-6 pb-0">
									<DialogTitle>
										{isEditingTitle ? (
											<form
												ref={formRef}
												onSubmit={async e => {
													e.preventDefault();

													const data = new FormData(
														e.target as HTMLFormElement
													);
													const title = data.get('title') as string;

													const isUpdated = await updateCard({
														cardId: card.id,
														boardId: params.boardId as string,
														data: {
															title,
														},
													});

													if (isUpdated) {
														toast.success(
															`Card title "${title}" updated successfully`
														);
													} else {
														toast.error(`Failed to update card title`);
													}

													setIsEditingTitle(false);
												}}
											>
												<Input
													className="p-0 h-7 text-xl"
													name="title"
													defaultValue={card.title}
													autoFocus
													spellCheck={false}
												/>
											</form>
										) : (
											<div
												className="text-left text-xl cursor-pointer"
												onClick={() => setIsEditingTitle(true)}
											>
												{card.title}
											</div>
										)}
									</DialogTitle>
									<DialogDescription className="text-left">
										in list
										<span className="ml-1 text-secondary-foreground">
											{list.title}
										</span>
									</DialogDescription>
								</div>
							</DialogHeader>
							<div className="p-6 pt-0">
								<CardContent {...card} />
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</CardContext.Provider>
	);
};
