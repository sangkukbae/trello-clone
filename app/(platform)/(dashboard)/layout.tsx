import { auth } from '@clerk/nextjs';

import { Navbar } from '@/components/navbar';
import { redirect } from 'next/navigation';
import { getBoards } from '@/app/actions';
import { Sidebar } from '@/components/sidebar';

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { userId, orgId } = auth();

	if (!userId) {
		redirect('/sign-in');
	}

	if (!orgId) {
		redirect('/select-workspace');
	}

	const boards = (await getBoards()) ?? [];
	return (
		<div className="w-full h-full">
			<Navbar boards={boards} />
			<main className="w-full h-[calc(100%-3rem)] flex ">
				<Sidebar boards={boards} />
				<div className="flex-1 w-full max-h-full overflow-y-auto ">
					{children}
				</div>
			</main>
		</div>
	);
}
