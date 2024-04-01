import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default async function PlatformLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
			}}
		>
			<TooltipProvider>{children}</TooltipProvider>
			<Toaster duration={3000} />
		</ClerkProvider>
	);
}
