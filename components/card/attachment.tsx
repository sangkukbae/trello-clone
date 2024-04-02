'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import path from 'path';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

import { deleteAttachment, updateAttachment, updateCard } from '@/app/actions';
import { supabase } from '@/lib/supabase';
import { Attachment as AttachmentType } from '@prisma/client';
import { BUCKET_NAME, PUBLIC_BUCKET_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useContext } from 'react';
import { CardContext } from '.';

export const Attachment = (props: AttachmentType) => {
	const params = useParams();
	const { cardId, cover, coverImgUrl } = useContext(CardContext);
	const publicUrl = `${PUBLIC_BUCKET_URL}/${props.filePath}`;

	const isValidImageExtension = (filePath: string) => {
		const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
		const extension = getFileExtension(filePath);
		return imageExtensions.includes(extension.toLowerCase());
	};

	const getFileExtension = (filePath: string) => {
		return path.extname(filePath).slice(1);
	};

	const downloadFile = async (filePath: string) => {
		const { data, error } = await supabase.storage
			.from(BUCKET_NAME)
			.download(filePath);

		if (error) throw new Error(error.message);

		// Create a blob from the data
		const blob = new Blob([data], { type: 'application/octet-stream' });

		// Create an object URL for the blob
		const url = window.URL.createObjectURL(blob);

		// Create a link and programmatically click it to initiate download
		const link = document.createElement('a');
		link.href = url;
		link.download = filePath.split('/').pop() || 'download'; // Use the last part of the filePath as the download name, or 'download' if it's not available
		link.click();

		// Clean up: revoke the object URL after calling download
		window.URL.revokeObjectURL(url);
	};

	const removeFile = async (filePath: string) => {
		const { error } = await supabase.storage
			.from(BUCKET_NAME)
			.remove([filePath]);

		if (error) {
			console.error('Error deleting file:', error.message);
			return;
		}

		await deleteAttachment(props.id, params.boardId as string);

		toast.success(`File "${props.name}" deleted successfully`);
	};

	const moveFile = async (
		filePath: string,
		newFilePath: string
	): Promise<boolean> => {
		const { error } = await supabase.storage
			.from(BUCKET_NAME)
			.move(filePath, newFilePath);

		if (error) {
			console.error('Error moving file:', error.message);
			return false;
		}

		return true;
	};

	return (
		<div className="px-0 w-full min-h-[104px] h-fit flex justify-start items-center bg-secondary rounded-md">
			<div
				className="mx-2 w-[112px] h-20 flex items-center justify-center rounded-md overflow-hidden cursor-pointer"
				onClick={() => publicUrl && window.open(publicUrl, '_blank')}
			>
				{publicUrl ? (
					isValidImageExtension(props.name) ? (
						<Image
							className="rounded-md"
							src={publicUrl}
							width={112}
							height={80}
							layout="fixed"
							alt={props.name}
						/>
					) : (
						<span className="text-muted-foreground font-bold">
							{getFileExtension(props.name).toUpperCase()}
						</span>
					)
				) : (
					<Skeleton className="w-[112px] h-80" />
				)}
			</div>
			<div className="flex-grow self-center space-y-1">
				<h4 className="text-sm font-bold">{props.name}</h4>
				<div>
					<span className="mr-2 text-sm text-muted-foreground">
						Added {formatDistanceToNow(props.createdAt, { addSuffix: true })}
					</span>
					<Button
						className="px-0 mr-2 text-muted-foreground"
						variant="link"
						onClick={() => downloadFile(props.filePath)}
					>
						Download
					</Button>
					<Button
						className="px-0 mr-2 text-muted-foreground"
						variant="link"
						onClick={() => removeFile(props.filePath)}
					>
						Delete
					</Button>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								className="px-0 mr-2 text-muted-foreground"
								variant="link"
							>
								Edit
							</Button>
						</PopoverTrigger>
						<PopoverContent>
							<header className="h-10 flex justify-center items-center">
								<h4 className="text-sm font-bold">Edit attachment</h4>
							</header>
							<form
								className="space-y-2"
								onSubmit={async e => {
									e.preventDefault();

									const formData = new FormData(e.target as HTMLFormElement);
									const name = formData.get('name') as string;

									if (!name) return;

									const newFilePath = props.filePath.replace(props.name, name);

									const isUpdated = await moveFile(props.filePath, newFilePath);

									if (isUpdated) {
										await updateAttachment(props.id, params.boardId as string, {
											name,
											filePath: newFilePath,
										});
										toast.success(`File "${name}" updated successfully`);
									}
								}}
							>
								<Input name="name" defaultValue={props.name} />
								<Button className="w-full" type="submit">
									Update
								</Button>
							</form>
						</PopoverContent>
					</Popover>
					{isValidImageExtension(props.name) && (
						<div>
							{cover || coverImgUrl ? (
								<Button
									className="px-0 text-muted-foreground"
									variant="link"
									onClick={async () => {
										const isRemoved = await updateCard({
											cardId,
											boardId: params.boardId as string,
											data: {
												coverImgUrl: null,
											},
										});

										if (isRemoved) {
											toast.success('Cover image removed successfully');
										} else {
											toast.error('Failed to remove cover image');
										}
									}}
								>
									Remove cover
								</Button>
							) : (
								<Button
									className="px-0 text-muted-foreground"
									variant="link"
									onClick={async () => {
										const isUpdated = await updateCard({
											cardId,
											boardId: params.boardId as string,
											data: {
												coverImgUrl: `${PUBLIC_BUCKET_URL}/${props.filePath}`,
											},
										});

										if (isUpdated) {
											toast.success(
												`Cover image "${props.name} updated successfully`
											);
										} else {
											toast.error('Failed to updated cover image');
										}
									}}
								>
									Make cover
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
