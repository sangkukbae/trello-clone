'use client';

import Image from 'next/image';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Check, MoreHorizontal } from 'lucide-react';

import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SelectBackground } from '@/components/select-background';
import { cn } from '@/lib/utils';
import { createBoard } from '@/app/actions';
import { createContext, useContext, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { toast } from 'sonner';
import { type ImageInfo } from '@/lib/types';
import { defaultColorList, defaultImageList } from '@/lib/constants';

interface BoardImageContextProps {
	background: string;
	setBackground: (background: string) => void;
	tempImgInfo?: ImageInfo;
	setTempImgInfo?: (imgInfo: ImageInfo) => void;
}

export const BoardImageContext = createContext<BoardImageContextProps>({
	background: '',
	setBackground: () => {},
	tempImgInfo: undefined,
	setTempImgInfo: () => {},
});

const formSchema = z.object({
	title: z.string().min(3, {
		message: 'Board name must be at least 3 characters long',
	}),
	background: z.string(),
});

export const CreateBoard = () => {
	const [background, setBackground] = useState('');
	const [isOpenPopover, setIsOpenPopover] = useState(false);
	const [tempImgInfo, setTempImgInfo] = useState<ImageInfo | undefined>(
		undefined
	);
	const popoverContentRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(popoverContentRef, () => setIsOpenPopover(false));

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			background: '',
		},
	});

	// const { background } = form.watch();

	const getBoardImg = (background: string, size: 'small' | 'full') => {
		let src;
		if (defaultColorList.includes(background)) {
			src = `/board-background/${background}.svg`;
		} else {
			const image = defaultImageList.find(img => img.id === background);
			if (image) {
				src = image.urls[size];
			} else {
				src =
					size === 'small'
						? tempImgInfo?.imageThumbUrl
						: tempImgInfo?.imageFullUrl;
				src = src || defaultImageList[0].urls[size];
			}
		}
		return src;
	};
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const { title } = values;
		const isCreated = await createBoard({
			title,
			imageThumbUrl: getBoardImg(background, 'small'),
			imageFullUrl: getBoardImg(background, 'full'),
		});

		if (isCreated) {
			toast.success(`Board "${title}" created!`);
		} else {
			toast.error('Failed to create board');
		}
	};

	return (
		<BoardImageContext.Provider
			value={{
				background,
				setBackground,
				tempImgInfo,
				setTempImgInfo,
			}}
		>
			<div className="space-y-2">
				<header className="relative w-full h-10 flex justify-center items-center">
					<h4 className="text-sm font-bold">Create board</h4>
				</header>
				<div className="pb-1 flex justify-center">
					<div className="w-[200px] h-[120px] bg-primary rounded-md overflow-hidden">
						<Image
							src={getBoardImg(background, 'small')}
							width={200}
							height={120}
							alt="bg"
						/>
					</div>
				</div>
				<Form {...form}>
					<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
						{/* background */}
						<FormField
							control={form.control}
							name="background"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs text-muted-foreground font-bold">
										Background
									</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={value => {
												// field.onChange(value);
												setBackground(value);
											}}
											{...field}
										>
											<ul className="flex justify-around gap-x-1 mt-2 pb-2">
												{defaultImageList.slice(0, 4).map(image => (
													<li className="relative" key={image.id}>
														<RadioGroupItem
															className="absolute top-0 left-0 w-0 h-0 pointer-events-none clip-rect"
															value={image.id}
															id={image.id}
														/>
														<Label
															className="cursor-pointer"
															htmlFor={image.id}
														>
															<div
																className={cn(
																	'w-[64px] h-10 rounded-md bg-primary before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent hover:before:bg-white/20',
																	{
																		'before:bg-white/20':
																			(background || defaultImageList[0].id) ===
																			image.id,
																	}
																)}
															>
																<Image
																	src={image.urls.thumb}
																	width={64}
																	height={40}
																	alt="bg"
																/>
															</div>
														</Label>

														<div
															className={cn(
																'hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4',
																{
																	block:
																		(background || defaultImageList[0].id) ===
																		image.id,
																}
															)}
														>
															<Check className="w-4 h-4 text-secondary" />
														</div>
													</li>
												))}
											</ul>
											<ul className="flex justify-around gap-x-1">
												{defaultColorList.slice(0, 5).map(bg => (
													<li className="relative" key={bg}>
														<RadioGroupItem
															className="absolute top-0 left-0 w-0 h-0 pointer-events-none clip-rect"
															value={bg}
															id={bg}
														/>
														<Label className="cursor-pointer" htmlFor={bg}>
															<div
																className={cn(
																	'w-10 h-8 rounded-md bg-primary before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent hover:before:bg-white/20',
																	{
																		'before:bg-white/20': background === bg,
																	}
																)}
															>
																<Image
																	className="rounded-md"
																	src={`/board-background/${bg + '.svg'}`}
																	width={40}
																	height={32}
																	alt="bg"
																/>
															</div>
														</Label>

														<div
															className={cn(
																'hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4',
																{ block: background === bg }
															)}
														>
															<Check className="w-4 h-4 text-secondary" />
														</div>
													</li>
												))}

												<Popover open={isOpenPopover}>
													<PopoverTrigger asChild>
														<Button
															className="w-10 h-8"
															variant="secondary"
															onClick={() => setIsOpenPopover(true)}
														>
															<MoreHorizontal className="w-4 h-4" />
														</Button>
													</PopoverTrigger>
													<PopoverContent
														className="p-3 w-modal space-y-2"
														ref={popoverContentRef}
														side="left"
													>
														<SelectBackground />
													</PopoverContent>
												</Popover>
											</ul>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* board title */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs text-muted-foreground font-bold">
										Board title
									</FormLabel>
									<FormControl>
										<Input type="text" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button className="w-full" type="submit">
							Create
						</Button>
					</form>
				</Form>
			</div>
		</BoardImageContext.Provider>
	);
};
