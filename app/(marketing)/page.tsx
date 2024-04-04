import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@clerk/nextjs';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ButtonCarousel } from '@/components/button-carousel';
import { CardCaroudel } from '@/components/card-carousel';
import { cn } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default function Page() {
	const { userId, orgId } = auth();

	if (userId && orgId) {
		redirect(`/w/${orgId}`);
	}

	if (userId && !orgId) {
		redirect('/select-workspace');
	}

	return (
		<div className="min-h-screen flex flex-col">
			<header className="grow-0 shrink-0 fixed top-0 left-0 w-full h-[60px] bg-white shadow-xl z-10">
				<nav className="w-full h-full flex justify-between items-center">
					<Link className="px-4" href="/">
						<Image
							src="/trello-logo-wide.svg"
							width={112}
							height={23}
							alt="logo"
						/>
					</Link>
					<Link
						className={cn(
							buttonVariants({ variant: 'secondary' }),
							'w-[196px] h-[60px] px-4 text-xl rounded-none'
						)}
						href="/sign-in"
					>
						Log in
					</Link>
				</nav>
			</header>
			<main className="w-full grow">
				{/* hero */}
				<section className="w-full h-[60px]"></section>
				<section
					className="w-full h-fit bg-blend-normal"
					style={{
						background:
							"url('/images/white-wave-bg.svg') center bottom -0.5px / 100% 14% no-repeat scroll padding-box border-box, linear-gradient(60deg, rgb(82, 67, 170), rgb(237, 80, 180)) 0% 0% / auto repeat scroll padding-box border-box rgb(82, 67, 170)",
					}}
				>
					<div className="t-container">
						<div className="w-full flex flex-col lg:flex-row flex-wrap justify-start items-center">
							<div className="w-full text-center lg:w-1/2 lg:text-left px-4 pt-32 pb-4 lg:pb-32 ">
								<h1 className="mb-2 text-5xl leading-tight font-bold">
									Trello brings all your tasks, teammates, and tools together
								</h1>
								<p className="mb-6 text-xl">
									Keep everything in the same place—even if your team isn’t.
								</p>
							</div>
							<div className="w-full lg:w-1/2 px-4 py-4 lg:pt-32 flex justify-center text-center">
								<Image
									src="/images/trello-ui-collage.webp"
									width={688}
									height={558}
									alt="trello ui collage"
								/>
							</div>
						</div>
					</div>
				</section>
				{/* trello 101 */}
				<section
					className="bg-white text-primary-foreground bg-blend-normal"
					style={{
						background:
							'linear-gradient(0deg, rgb(230, 252, 255), rgb(255, 255, 255)) 0% 0% / auto repeat scroll padding-box border-box rgb(178, 212, 255)',
					}}
				>
					<div className="t-container">
						<div className="max-w-[58%] p-4">
							<p className="mb-2 text-base font-semibold">TRELLO 101</p>
							<h2 className="mb-6 text-4xl font-semibold">
								A productivity powerhouse
							</h2>
							<p className="text-xl">
								Simple, flexible, and powerful. All it takes are boards, lists,
								and cards to get a clear view of who’s doing what and what needs
								to get done. Learn more in our{' '}
								<Link href="/">guide for getting started</Link>.
							</p>
						</div>
						<ButtonCarousel />
					</div>
				</section>
				{/* trello in action */}
				<section className="bg-white text-primary-foreground">
					<div className="h-12"></div>
					<div className="t-container">
						<div className="p-4">
							<p className="mb-2 text-base font-semibold">TRELLO IN ACTION</p>
							<h2 className="mb-6 text-4xl font-semibold">
								Workflows for any project, big or small
							</h2>
						</div>
						<CardCaroudel />

						<div className="p-4 flex flex-col lg:flex-row items-start lg:items-center gap-4">
							<p className="text-lg">
								No need to start from scratch. Jump-start your workflow with a
								proven playbook designed for different teams. Customize it to
								make it yours.
							</p>
							<Button
								className="w-[196px] text-base"
								variant="secondary"
								size="lg"
							>
								Explore all Use Cases
							</Button>
						</div>
					</div>
				</section>
			</main>
			<footer>
				<div className="t-container">
					<div className="flex justify-between items-center">
						<Link className="p-4" href="/">
							<Image
								src="/trello-logo-white.svg"
								width={112}
								height={23}
								alt="logo"
							/>
						</Link>
						<Link
							className={cn(
								buttonVariants({ size: 'lg' }),
								'mt-2 mr-4 text-base font-semibold'
							)}
							href="/sign-in"
						>
							Log in
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
