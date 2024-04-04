'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Book, Cloud, Folder, Leaf, ListChecks, Megaphone } from 'lucide-react';

export const workflows = [
	{
		title: 'Project management',
		description:
			'Keep tasks in order, deadlines on track, and team members aligned with Trello.',
		icon: <Folder className="w-8 h-8 text-orange-500 fill-orange-500 " />,
		color: 'orange',
	},
	{
		title: 'Meetings',
		description:
			'Empower your team meetings to be more productive, empowering, and dare we say—fun.',
		icon: <Megaphone className="w-8 h-8 text-blue-500 fill-blue-500" />,
		color: 'blue',
	},
	{
		title: 'Onboarding',
		description:
			'Onboarding to a new company or project is a snap with Trello’s visual layout of to-do’s, resources, and progress tracking.',
		icon: <Leaf className="w-8 h-8 text-green-500 fill-green-500" />,
		color: 'green',
	},

	{
		title: 'Task management',
		description:
			'Use Trello to track, manage, complete, and bring tasks together like the pieces of a puzzle, and make your team’s projects a cohesive success every time.',
		icon: <ListChecks className="w-8 h-8 text-yellow-500" />,
		color: 'yellow',
	},
	{
		title: 'Brainstorming',
		description:
			'Unleash your team’s creativity and keep ideas visible, collaborative, and actionable.',
		icon: <Cloud className="w-8 h-8 text-indigo-500 fill-indigo-500" />,
		color: 'indigo',
	},
	{
		title: 'Resource hub',
		description:
			'Save time with a well-designed hub that helps teams find information easily and quickly.',
		icon: <Book className="w-8 h-8 text-purple-500 fill-purple-500" />,
		color: 'purple',
	},
];
export const CardCaroudel = () => {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		api.on('select', () => {
			setCurrent(api.selectedScrollSnap());
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api]);
	return (
		<div className="max-w-[688px] md:max-w-[960px] lg:max-w-[1140px] h-full mx-auto p-4 pb-8 lg:pb-4">
			<Carousel className="" setApi={setApi}>
				<div className="hidden lg:flex relative w-full h-[30px]  justify-end items-center">
					<CarouselPrevious className="right-16 " />
					<CarouselNext className="right-4" />
				</div>
				<CarouselContent>
					{workflows.map(({ title, description, icon, color }, index) => (
						<CarouselItem
							className="p-4 md:basis-[580px] lg:basis-1/3 "
							key={index}
						>
							<div className="relative md:w-[568px] lg:w-[348px] h-[244px] bg-white shadow-xl rounded-lg">
								<div
									className={cn('w-full h-12 rounded-tl-lg rounded-tr-lg', {
										'bg-orange-500': color === 'orange',
										'bg-blue-500': color === 'blue',
										'bg-green-500': color === 'green',
										'bg-yellow-500': color === 'yellow',
										'bg-indigo-500': color === 'indigo',
										'bg-purple-500': color === 'purple',
									})}
								></div>
								<div className="absolute top-6 left-4 w-12 h-12 flex justify-center items-center bg-white rounded-lg">
									{icon}
								</div>
								<div className="p-6 pt-[36px]">
									<h3 className="mb-2 text-2xl font-semibold">{title}</h3>
									<p>{description}</p>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
			<div className="lg:hidden w-full h-4 mt-4">
				<div className="relative h-full rounded-full bg-accent/20">
					<div
						className="absolute w-1/6 h-full rounded-full bg-accent transition-all duration-300 ease-linear"
						style={{ left: `${(current / workflows.length) * 100}%` }}
					></div>
				</div>
			</div>
		</div>
	);
};
