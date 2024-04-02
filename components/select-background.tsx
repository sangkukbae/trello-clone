import { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounceCallback, useIntersectionObserver } from 'usehooks-ts';
import { Check, ChevronLeft } from 'lucide-react';

import { unsplash } from '@/lib/unsplash';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BoardImageContext } from '@/components/create-board';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { defaultColorList, defaultImageList } from '@/lib/constants';

type MoreType = 'none' | 'photos' | 'colors';

interface SelectBackgroundContextProps {
	currentMore: MoreType;
	setCurrentMore: (currentMore: MoreType) => void;
}

const SelectBackgroundContext = createContext<SelectBackgroundContextProps>({
	currentMore: 'none',
	setCurrentMore: () => {},
});

export const SelectBackground = () => {
	const [currentMore, setCurrentMore] = useState<MoreType>('none');
	const { background, setBackground } = useContext(BoardImageContext);

	return (
		<SelectBackgroundContext.Provider value={{ currentMore, setCurrentMore }}>
			<div id="select-background">
				{/* default photos and colors */}
				{currentMore === 'none' && (
					<div className="space-y-2">
						<header className="relative w-full h-10 flex justify-center items-center">
							<h4 className="text-sm font-bold">Board background</h4>
						</header>

						<label className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Photos</span>
							<Button
								className="text-muted-foreground"
								variant="secondary"
								onClick={e => {
									e.stopPropagation();
									setCurrentMore('photos');
								}}
							>
								See more
							</Button>
						</label>

						<ul className="flex flex-wrap justify-around gap-2 pb-2">
							{defaultImageList.map(image => (
								<li
									className="group relative cursor-pointer"
									key={image.id}
									onClick={() => setBackground(image.id)}
								>
									<div
										className={cn(
											'w-[86px] h-[56px] rounded-md bg-primary before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent group-hover:before:bg-white/20',
											{
												'before:bg-white/20':
													(background || defaultImageList[0].id) === image.id,
											}
										)}
									>
										<Image
											src={image.urls.thumb}
											width={86}
											height={56}
											alt="bg"
										/>
									</div>
									<Link
										className="py-[2px] px-1 absolute bottom-0 block w-full height-5 text-primary-foreground text-xs underline text-left truncate opacity-0 transition-opacity duration-75 bg-white/40 group-hover:opacity-100 hover:bg-white/60"
										href={image.links.html}
										target="_blank"
									>
										{image.user.name}
									</Link>
									<div
										className={cn(
											'hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4',
											{
												block:
													(background || defaultImageList[0].id) === image.id,
											}
										)}
									>
										<Check className="w-4 h-4 text-secondary" />
									</div>
								</li>
							))}
						</ul>

						<label className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Colors</span>
							<Button
								className="text-muted-foreground"
								variant="secondary"
								onClick={e => {
									e.stopPropagation();
									setCurrentMore('colors');
								}}
							>
								See more
							</Button>
						</label>
						<ul className="flex flex-wrap justify-around gap-2 pb-2">
							{defaultColorList.slice(0, 6).map(bg => (
								<li
									className="relative cursor-pointer"
									key={bg}
									onClick={() => setBackground(bg)}
								>
									<div
										className={cn(
											'w-[86px] h-[56px] rounded-md bg-primary before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent hover:before:bg-white/20',
											{
												'before:bg-white/20': background === bg,
											}
										)}
									>
										<Image
											className="rounded-md"
											src={`/board-background/${bg + '.svg'}`}
											width={86}
											height={56}
											alt="bg"
										/>
									</div>
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
						</ul>
					</div>
				)}
				{/* more photos */}
				{currentMore === 'photos' && <PhotosBackground />}
				{/* more colors */}
				{currentMore === 'colors' && <ColorsBackground />}
			</div>
		</SelectBackgroundContext.Provider>
	);
};

const PhotosBackground = () => {
	const [search, setSearch] = useState('');
	const [images, setImages] = useState<Record<string, any>[]>(defaultImageList);
	const [page, setPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);

	const { setCurrentMore } = useContext(SelectBackgroundContext);
	const { background, setBackground, setTempImgInfo } =
		useContext(BoardImageContext);

	const { isIntersecting, ref } = useIntersectionObserver({
		threshold: 0.5,
		rootMargin: '0px 0px 100px 0px',
	});

	const fetchImages = async () => {
		try {
			const { response } = await unsplash.collections.getPhotos({
				collectionId: '317099',
				page,
				perPage: 30,
			});

			if (response?.results && response.results.length > 0) {
				setImages(prev => [...prev, ...response.results]);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const debouncedFetchImages = useDebounceCallback(async () => {
		if (!search.trim()) return;

		try {
			const images = await unsplash.search.getPhotos({
				query: search,
				page,
				perPage: 30,
				collectionIds: ['317099'],
			});
			if (images && images.response) {
				setImages(images.response.results);
			} else {
				setImages(defaultImageList);
			}
		} catch (error) {
			console.error(error);
			setImages(defaultImageList);
		}
	}, 500);

	useEffect(() => {
		fetchImages();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		debouncedFetchImages();
		return () => debouncedFetchImages.cancel();
	}, [search, debouncedFetchImages]);

	useEffect(() => {
		if (isIntersecting) {
			setPage(prev => prev + 1);
		}
	}, [isIntersecting]);

	useEffect(() => {
		if (page > 1) {
			fetchImages();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);

	if (isLoading) {
		return (
			<div className="w-full space-y-2">
				<header className="relative w-full h-10 flex justify-center items-center">
					<h4 className="text-sm font-bold">
						Photos by&nbsp;
						<Link
							className="hover:underline"
							href="https://unsplash.com/"
							target="_blank"
						>
							Unsplash
						</Link>
					</h4>
					<Button
						className="absolute top-1 left-1 flex justify-center items-center"
						variant="ghost"
						size="icon"
						onClick={() => setCurrentMore('none')}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
				</header>
				<Input placeholder="Photos" />
				<div className="max-h-[400px] overflow-y-auto grid grid-cols-2 gap-2">
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
					<Skeleton className="w-[128px] h-[73px] rounded-md" />
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-2">
			<header className="relative w-full h-10 flex justify-center items-center">
				<h4 className="text-sm font-bold">
					Photos by&nbsp;
					<Link
						className="hover:underline"
						href="https://unsplash.com/"
						target="_blank"
					>
						Unsplash
					</Link>
				</h4>
				<Button
					className="absolute top-1 left-1 flex justify-center items-center"
					variant="ghost"
					size="icon"
					onClick={() => setCurrentMore('none')}
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>
			</header>
			<Input
				placeholder="Photos"
				value={search}
				onChange={e => setSearch(e.target.value)}
			/>
			<ul className="max-h-[400px] overflow-y-auto grid grid-cols-2 gap-2">
				{images.map(image => (
					<li
						className="group relative w-[135px] h-[73px] cursor-pointer"
						key={image.id}
						onClick={() => {
							setBackground(image.id);
							setTempImgInfo?.({
								id: image.id,
								imageThumbUrl: image.urls.small,
								imageFullUrl: image.urls.full,
								imageUserName: image.user.name,
								imageLinkHtml: image.links.html,
							});
						}}
					>
						<div
							className={cn(
								'w-[135px] h-[73px] rounded-md bg-primary overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent group-hover:before:bg-white/20',
								{
									'before:bg-white/20': background === image.id,
								}
							)}
						>
							<Image
								src={image?.urls?.thumb}
								width={135}
								height={73}
								alt="bg"
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
								{ block: background === image.id }
							)}
						>
							<Check className="w-4 h-4 text-secondary" />
						</div>
					</li>
				))}
				<div ref={ref}></div>
			</ul>
		</div>
	);
};

const ColorsBackground = () => {
	const { setCurrentMore } = useContext(SelectBackgroundContext);
	const { background, setBackground } = useContext(BoardImageContext);
	return (
		<div className="w-full space-y-2">
			<header className="">
				<div className="relative w-full h-10 flex justify-center items-center">
					<h4 className="text-sm font-bold">Colors</h4>
					<Button
						className="absolute top-1 left-1 flex justify-center items-center"
						variant="ghost"
						size="icon"
						onClick={() => setCurrentMore('none')}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
				</div>
			</header>
			<ul className="max-h-[400px] overflow-y-auto grid grid-cols-3 gap-2">
				{defaultColorList.map(bg => (
					<li
						className="relative w-[86px] h-[56px] bg-primary rounded-md cursor-pointer"
						key={bg}
						onClick={() => setBackground(bg)}
					>
						<div
							className={cn(
								'w-[86px] h-[56px] rounded-md bg-primary before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-transparent hover:before:bg-white/20',
								{
									'before:bg-white/20': background === bg,
								}
							)}
						>
							<Image
								className="rounded-md"
								src={`/board-background/${bg + '.svg'}`}
								width={86}
								height={56}
								alt="bg"
							/>
						</div>
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
			</ul>
		</div>
	);
};
