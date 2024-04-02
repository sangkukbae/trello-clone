import { ReactNode, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDebounceCallback } from 'usehooks-ts';
import { toast } from 'sonner';
import { Check, ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CardContext } from '@/components/card';
import {
	PUBLIC_BUCKET_URL,
	defaultColorList,
	defaultImageList,
} from '@/lib/constants';
import { Separator } from '../ui/separator';
import { FormUpload } from '../form/form-upload';
import { Input } from '../ui/input';
import { unsplash } from '@/lib/unsplash';
import { Skeleton } from '../ui/skeleton';
import { updateCard } from '@/app/actions';

const suggestedSearches = [
	'Productivity',
	'Perspective',
	'Organization',
	'Colorful',
	'Nature',
	'Business',
	'Minimal',
	'Space',
	'Animal',
];

export const SelectCover = ({
	coverImgUrl,
	children,
}: {
	coverImgUrl: string | null;
	children: ReactNode;
}) => {
	const params = useParams();
	const { cardId, cover, setCover } = useContext(CardContext);

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-modal space-y-2" side="left">
				<header className="h-10 flex justify-center items-center">
					<span className="text-sm font-bold">Cover</span>
				</header>

				<div className="space-y-2">
					{/* remove cover */}
					<Button
						className="w-full mb-2"
						variant="destructive"
						onClick={async () => {
							setCover('');

							if (coverImgUrl) {
								const isUpdated = await updateCard({
									cardId,
									boardId: params.boardId as string,
									data: { coverImgUrl: null },
								});

								if (isUpdated) {
									toast.success('Cover image removed successfully');
								} else {
									toast.error('Failed to remove cover image');
								}
							}
						}}
					>
						Remove cover
					</Button>
					{/* default colors */}
					<BasicColors />
				</div>

				{/* default photos */}
				<div className="space-y-2">
					<BasicPhotos />
					<SearchPhoto />
				</div>

				<Separator />

				<FormUpload
					buttonName="Upload a cover image"
					onUpload={async path => {
						if (!path) return;
						const isUpdated = await updateCard({
							cardId,
							boardId: params.boardId as string,
							data: { coverImgUrl: `${PUBLIC_BUCKET_URL}/${path}` },
						});

						if (isUpdated) {
							toast.success('Cover image updated successfully');
						} else {
							toast.error('Failed to updated cover image');
						}
					}}
				/>
			</PopoverContent>
		</Popover>
	);
};

export const BasicColors = () => {
	const { cover, setCover } = useContext(CardContext);
	return (
		<>
			<Label>Colors</Label>
			<ul className="flex flex-wrap justify-around gap-2 pb-2">
				{defaultColorList.slice(0, 8).map(color => (
					<li
						className="relative cursor-pointer"
						key={color}
						onClick={() => setCover(color)}
					>
						<div
							className={cn(
								'w-[60px] h-[32px] rounded-md bg-primary before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent hover:before:bg-white/20',
								{
									'before:bg-white/20': cover === color,
								}
							)}
						>
							<Image
								className="rounded-md"
								src={`/board-background/${color + '.svg'}`}
								width={60}
								height={32}
								alt="cover"
							/>
						</div>
						<div
							className={cn(
								'hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4',
								{ block: cover === color }
							)}
						>
							<Check className="w-4 h-4 text-secondary" />
						</div>
					</li>
				))}
			</ul>
		</>
	);
};

export const BasicPhotos = () => {
	const { cover, setCover } = useContext(CardContext);
	return (
		<>
			<Label>Photos</Label>
			<ul className="flex flex-wrap justify-around gap-2 pb-2">
				{defaultImageList.slice(0, 7).map(image => (
					<li
						className="group relative cursor-pointer"
						key={image.id}
						onClick={() => setCover(image.id)}
					>
						<div
							className={cn(
								'w-[80px] h-[48px] rounded-md bg-primary overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent hover:before:bg-white/20',
								{
									'before:bg-white/20': cover === image.id,
								}
							)}
						>
							<Image
								className="rounded-md"
								src={image.urls.small}
								width={80}
								height={48}
								alt="cover"
							/>
						</div>

						<Link
							className="py-[2px] px-1 absolute bottom-0 block w-full height-5 text-primary-foreground text-xs underline text-left truncate opacity-0 transition-opacity duration-75 bg-white/40 group-hover:opacity-100 hover:bg-white/60"
							href={image?.links?.html ?? ''}
							target="_blank"
						>
							{image?.user?.name}
						</Link>
						<div
							className={cn(
								'hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4',
								{ block: cover === image.id }
							)}
						>
							<Check className="w-4 h-4 text-secondary" />
						</div>
					</li>
				))}
			</ul>
		</>
	);
};

export const SearchPhoto = () => {
	const [topPhotos, setTopPhotos] = useState<Record<string, any>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [images, setImages] = useState<Record<string, any>>([]);
	const [searchLoading, setSearchLoading] = useState(false);

	const { setCover, setTempImgInfo } = useContext(CardContext);

	const debouncedFetchImages = useDebounceCallback(async () => {
		if (!search.trim()) return;

		setSearchLoading(true);
		try {
			const images = await unsplash.search.getPhotos({
				query: search,
				page: 1,
				perPage: 30,
			});
			if (images && images.response) {
				setImages(images.response.results);
			} else {
				setImages(defaultImageList);
			}
		} catch (error) {
			console.error(error);
			setImages(defaultImageList);
		} finally {
			setSearchLoading(false);
		}
	}, 500);

	useEffect(() => {
		const getTopPhotos = async () => {
			setIsLoading(true);
			try {
				const { response } = await unsplash.collections.getPhotos({
					collectionId: '317099',
					page: 1,
					perPage: 12,
				});

				if (response?.results && response.results.length > 0) {
					setTopPhotos(response.results);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		getTopPhotos();
	}, []);

	useEffect(() => {
		debouncedFetchImages();

		return () => debouncedFetchImages.cancel();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="w-full" variant="secondary">
					Search for photos
				</Button>
			</PopoverTrigger>
			<PopoverContent side="right" className="w-modal h-full space-y-4">
				<header className="relative h-10 flex justify-center items-center">
					<h4 className="text-sm font-bold">Search photos</h4>
					{search && (
						<Button
							className="absolute top-1 left-1"
							variant="ghost"
							onClick={() => setSearch('')}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
					)}
				</header>

				<div className="h-full space-y-2">
					<Input
						value={search}
						onChange={e => setSearch(e.target.value)}
						placeholder="Search Unsplash for photos"
					/>

					{search ? (
						<SearchResult searchLoading={searchLoading} images={images} />
					) : (
						<>
							<SearchSuggestionList setSearch={setSearch} />
							<TopPhotos isLoading={isLoading} topPhotos={topPhotos} />
						</>
					)}
				</div>
				<footer>
					<p className="text-right text-xs text-muted-foreground ">
						Photos from Unsplash
					</p>
				</footer>
			</PopoverContent>
		</Popover>
	);
};

export const SearchResult = ({
	images,
	searchLoading,
}: {
	images: Record<string, any>;
	searchLoading: boolean;
}) => {
	const { setCover, setTempImgInfo } = useContext(CardContext);

	return (
		<div className="h-full space-y-2">
			<Label className="text-muted-foreground">Results</Label>
			<ul className="max-h-[520px] overflow-y-auto grid grid-cols-2 gap-2">
				{searchLoading
					? Array.from({ length: 12 }, (_, i) => (
							<Skeleton className="w-[130px] h-[81px] " key={i} />
					  ))
					: images.map((image: any) => (
							<li
								className="group relative w-[130px] h-[81px] cursor-pointer"
								key={image.id}
								onClick={() => {
									setCover(image.id);
									setTempImgInfo?.({
										id: image.id,
										imageThumbUrl: image.urls.small,
										imageFullUrl: image.urls.full,
										imageUserName: image.user.name,
										imageLinkHtml: image.links.html,
									});
								}}
							>
								<div className="w-[130px] h-[81px] rounded-md bg-primary overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent hover:before:bg-white/20">
									<Image
										className="rounded-md"
										src={image.urls.small}
										width={130}
										height={81}
										alt="cover"
									/>
								</div>

								<Link
									className="py-[2px] px-1 absolute bottom-0 block w-full height-5 text-primary-foreground text-xs underline text-left truncate opacity-0 transition-opacity duration-75 bg-white/40 group-hover:opacity-100 hover:bg-white/60"
									href={image?.links?.html ?? ''}
									target="_blank"
								>
									{image?.user?.name}
								</Link>
							</li>
					  ))}
			</ul>
		</div>
	);
};

export const SearchSuggestionList = ({
	setSearch,
}: {
	setSearch: (search: string) => void;
}) => {
	return (
		<div className="space-y-2">
			<Label>Suggested searchs</Label>
			<div className="flex flex-wrap gap-2">
				{suggestedSearches.map((search, index) => (
					<Button
						key={index}
						variant="secondary"
						onClick={() => setSearch(search)}
					>
						{search}
					</Button>
				))}
			</div>
		</div>
	);
};

export const TopPhotos = ({
	topPhotos,
	isLoading,
}: {
	topPhotos: Record<string, any>;
	isLoading: boolean;
}) => {
	const { setCover, setTempImgInfo } = useContext(CardContext);
	return (
		<div className="space-y-2">
			<Label>Top photos</Label>
			<ul className="flex flex-wrap justify-center gap-2">
				{isLoading
					? Array.from({ length: 12 }).map((_, i) => (
							<Skeleton className="w-20 h-12" key={i} />
					  ))
					: topPhotos.map((photo: any) => (
							<li
								className="group relative w-20 h-12 cursor-pointer"
								key={photo.id}
								onClick={() => {
									setCover(photo.id);
									setTempImgInfo?.({
										id: photo.id,
										imageThumbUrl: photo.urls.small,
										imageFullUrl: photo.urls.full,
										imageUserName: photo.user.name,
										imageLinkHtml: photo.links.html,
									});
								}}
							>
								<div className="w-20 h-12 rounded-md bg-primary overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent group-hover:before:bg-white/20">
									<Image
										className="w-auth h-auto"
										src={photo.urls.small}
										width={80}
										height={48}
										layout="fixed"
										alt="cover"
									/>
								</div>

								<Link
									className="py-[2px] px-1 absolute bottom-0 block w-full height-5 text-primary-foreground text-xs underline text-left truncate opacity-0 transition-opacity duration-75 bg-white/40 group-hover:opacity-100 hover:bg-white/60"
									href={photo?.links?.html ?? ''}
									target="_blank"
								>
									{photo?.user?.name}
								</Link>
							</li>
					  ))}
			</ul>
		</div>
	);
};
