'use client';

import { ReactNode } from 'react';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { FormUpload } from '../form/form-upload';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';

export const AttachmentForm = ({ children }: { children: ReactNode }) => {
	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-modal space-y-4">
				<header className="h-10 flex justify-center items-center">
					<h4 className="text-sm font-bold">Attach</h4>
				</header>
				<div className="space-y-2">
					<p className="text-sm font-bold">Attach a file from your computer</p>
					<p className="text-sm text-muted-foreground">
						You can also drag and drop files to upload them.
					</p>
					<FormUpload buttonName="Choose a file" />
				</div>
				{/* <Separator />
				<div className="space-y-2">
					<Button className="w-full">Insert</Button>
					<Button className="w-full" variant="ghost">
						Cancel
					</Button>
				</div> */}
			</PopoverContent>
		</Popover>
	);
};
