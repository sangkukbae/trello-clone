'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { contents } from '@/lib/constants';

export const ButtonCarousel = () => {
	const [api, setApi] = useState<CarouselApi>();
	const [api2, setApi2] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		api.on('select', () => {
			api2?.scrollTo(api.selectedScrollSnap());
			setCurrent(api.selectedScrollSnap());
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api]);

	useEffect(() => {
		if (!api2) {
			return;
		}

		api2.on('select', () => {
			api?.scrollTo(api2.selectedScrollSnap());
			setCurrent(api2.selectedScrollSnap());
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api2]);
	return (
		<div className="w-full flex flex-wrap justify-start items-stretch">
			<div className="relative w-full px-4 pt-4 pb-20">
				<div className="flex flex-col lg:flex-row jusfity-start items-stretch">
					<div className="hidden lg:block relative w-full lg:w-1/3">
						<div className="flex flex-col justify-between gap-4">
							{contents.map((content, index) => (
								<button
									className={cn(
										'relative w-full h-[150px] p-4 pl-6 rounded-lg text-left cursor-pointer  ',
										{
											'bg-white shadow-xl after:bg-[rgb(0,199,229)] after:absolute after:top-0 after:bottom-0 after:left-0 after:w-2 after:rounded-tl-lg after:rounded-bl-lg':
												current === index,
										}
									)}
									key={index}
									onClick={() => {
										api?.scrollTo(index);
										setCurrent(index);
									}}
								>
									<h3 className="font-semibold">{content.title}</h3>
									<p>{content.description}</p>
								</button>
							))}
						</div>
					</div>
					<Carousel className="w-full lg:w-2/3 py-4 lg:px-4" setApi={setApi}>
						<CarouselContent>
							{contents.map((content, index) => (
								<CarouselItem className="" key={index}>
									<Image
										className="w-full h-auto"
										src={content.image}
										width={920}
										height={575}
										alt={content.title}
									/>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
					<Carousel
						className="lg:hidden w-full lg:w-2/3 py-4 lg:px-4"
						setApi={setApi2}
					>
						<CarouselContent>
							{contents.map((content, index) => (
								<CarouselItem className="cursor-grab" key={index}>
									<div className="relative w-full h-[150px] p-4 pl-6 flex flex-col justify-center rounded-lg text-left cursor-pointer bg-white shadow-xl after:bg-[rgb(0,199,229)] after:absolute after:top-0 after:bottom-0 after:left-0 after:w-2 after:rounded-tl-lg after:rounded-bl-lg">
										<h3 className="font-semibold">{content.title}</h3>
										<p>{content.description}</p>
									</div>
								</CarouselItem>
							))}
						</CarouselContent>
					</Carousel>
					<div className="lg:hidden py-4 flex justify-center gap-x-2">
						{[0, 1, 2].map(val => (
							<button
								className={cn(
									'w-2 h-2 rounded-full bg-accent/40 transition-all duration-300 ease-linear',
									{
										'w-[60px] bg-accent': current === val,
									}
								)}
								key={val}
								onClick={() => {
									api?.scrollTo(val);
									api2?.scrollTo(val);
									setCurrent(val);
								}}
							></button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
