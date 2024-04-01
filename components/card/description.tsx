'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { updateCard } from '@/app/actions';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
	description: z.string({ required_error: 'Description is required' }),
});

export const Description = ({
	cardId,
	description: desc,
}: {
	cardId: string;
	description: string | null;
}) => {
	const params = useParams();
	const [description, setDescription] = useState(desc || '');
	const [isEditingDescription, setIsEditingDescription] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			description,
		},
	});

	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.focus();
			textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
		}
	}, [isEditingDescription]);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const isUpdated = await updateCard({
			cardId,
			boardId: params.boardId as string,
			data: { description: values.description },
		});

		if (isUpdated) {
			toast.success('Description updated successfully');
		} else {
			toast.error('Failed to update description');
		}

		setDescription(values.description);
		setIsEditingDescription(false);
	};

	return (
		<div className="flex flex-col gap-y-2">
			<div className="h-8 flex justify-between items-center text-base">
				<span>Description</span>
				<Button
					variant="secondary"
					onClick={() => setIsEditingDescription(true)}
				>
					Edit
				</Button>
			</div>
			{isEditingDescription ? (
				<Form {...form}>
					<form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
						{/* <Editor defaultValue={description} ref={editorRef} /> */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											// ref={textareaRef}
											// name="description"
											// defaultValue={description}
											autoFocus
											spellCheck={false}
											{...field}
											ref={textareaRef}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="space-x-2">
							<Button type="submit" disabled={!form.formState.isDirty}>
								Save
							</Button>
							<Button
								variant="ghost"
								onClick={() => setIsEditingDescription(false)}
							>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			) : description?.length > 0 ? (
				<div
					className="max-h-20 text-sm overflow-y-auto cursor-pointer"
					// dangerouslySetInnerHTML={{
					// 	__html: editorRef.current?.getSemanticHTML() || '',
					// }}
					onClick={() => setIsEditingDescription(true)}
				>
					{desc}
				</div>
			) : (
				<Button
					className="h-16 justify-start items-start"
					variant="secondary"
					onClick={() => setIsEditingDescription(true)}
				>
					Add a more detailed description...
				</Button>
			)}
		</div>
	);
};
