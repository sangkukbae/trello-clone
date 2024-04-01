'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useOrganization } from '@clerk/clerk-react';
import { Check, Lock, Pencil, Upload, UserRoundPlus } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { InviteForm } from '@/components/invite-form';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
	title: z.string().min(3, {
		message: 'Please enter a valid title',
	}),
});

export const WorkspaceInfo = () => {
	const [isEditing, setIsEditing] = useState(false);
	const { organization, isLoaded } = useOrganization();
	const formRef = useRef<HTMLFormElement>(null);

	// Call useForm at the top level, without conditional checks
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '', // Set a temporary default value
		},
	});

	const { reset } = form;

	// useOnClickOutside(formRef, () => setIsEditing(false));

	useEventListener('keydown', e => {
		if (e.key === 'Escape') {
			setIsEditing(false);
		}
	});
	// Effect to update default values once organization is loaded
	useEffect(() => {
		if (organization) {
			reset({
				// Assuming you have a reset function from useForm
				title: organization.name ?? '',
			});
		}
	}, [organization, reset]);

	const onSubmit = async (value: z.infer<typeof formSchema>) => {
		await organization?.update({ name: value.title });
		setIsEditing(false);
	};

	const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (!file) return;

		try {
			await organization?.setLogo({ file });
		} catch (error) {
			console.error(error);
		}
	};

	if (!isLoaded) {
		return (
			<div className="p-8 flex flex-col md:flex-row justify-between space-y-2">
				<div className="w-full flex items-center gap-x-2">
					<Skeleton className="w-[60px] h-[60px] rounded-sm overflow-hidden" />
					<div className="w-full flex flex-col gap-y-2">
						<Skeleton className="w-[200px] h-7" />
						<Skeleton className="w-[60px] h-7" />
					</div>
				</div>
				<Skeleton className="w-[260px] h-8" />
			</div>
		);
	}

	return (
		<div className="p-8 flex flex-col md:flex-row justify-between space-y-2">
			<div className="flex items-center gap-x-2">
				<Popover>
					<PopoverTrigger>
						<div className="w-[60px] h-[60px] rounded-sm overflow-hidden">
							<Image
								src={organization?.imageUrl ?? ''}
								width={60}
								height={60}
								alt="logo"
							/>
						</div>
					</PopoverTrigger>
					<PopoverContent className="w-modal space-y-2">
						<header className="w-full h-10 flex justify-center items-center">
							<h4 className="text-sm font-bold">Change logo</h4>
						</header>
						<Label className="block" htmlFor="workspaceLogo">
							<div className={cn(buttonVariants(), 'w-full cursor-pointer')}>
								<Upload className="w-4 h-4 mr-2" />
								<span>Upload a new logo</span>
							</div>
						</Label>
						<Input
							className="hidden"
							id="workspaceLogo"
							type="file"
							onChange={onUpload}
						/>
					</PopoverContent>
				</Popover>
				<div className="flex flex-col">
					<div className="flex items-center gap-x-1">
						{isEditing ? (
							<Form {...form}>
								<form
									ref={formRef}
									className="space-y-4"
									onSubmit={form.handleSubmit(onSubmit)}
								>
									<FormField
										control={form.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input
														className="text-xl font-bold "
														type="text"
														{...field}
														autoFocus
														spellCheck={false}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</form>
							</Form>
						) : (
							<div className="max-w-[250px] text-xl font-bold truncate">
								{organization?.name}
							</div>
						)}
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsEditing(prev => !prev)}
						>
							{isEditing ? (
								<Check className="w-4 h-4" />
							) : (
								<Pencil className="w-4 h-4" />
							)}
						</Button>
					</div>
					<div className="flex items-center">
						<Lock className="w-4 h-4 mr-1 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">Private</span>
					</div>
				</div>
			</div>
			<Dialog>
				<DialogTrigger asChild>
					<Button>
						<UserRoundPlus className="w-4 h-4 mr-2" />
						<span>Invite Workspace members</span>
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite Workspace members</DialogTitle>
					</DialogHeader>
					<InviteForm />
				</DialogContent>
			</Dialog>
		</div>
	);
};
