import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Trello-clone',
	description: 'A Trello clone built with Next.js and Tailwind CSS',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html className="dark" lang="en">
			<body className={inter.className}>
				<div className="w-full h-screen">{children}</div>
			</body>
		</html>
	);
}
