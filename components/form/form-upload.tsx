import { useContext } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import { BUCKET_NAME } from '@/lib/constants';
import { createAttachment } from '@/app/actions';
import { CardContext } from '../card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';

export const FormUpload = ({
	buttonName = 'Choose a file',
	onUpload,
}: {
	buttonName: string;
	onUpload?: (path: string) => void;
}) => {
	const params = useParams();
	const { user } = useUser();

	const { cardId } = useContext(CardContext);

	const uploadFile = async (filePath: string, file: File) => {
		const { data, error } = await supabase.storage
			.from(BUCKET_NAME)
			.upload(filePath, file);

		if (error) throw new Error(error.message);

		if (data) {
			await createAttachment(params.boardId as string, {
				cardId,
				name: file.name,
				filePath,
			});

			onUpload?.(data.path);

			toast.success(`File "${file.name}" uploaded successfully`);
		}
	};
	return (
		<>
			<Label className="block" htmlFor="file">
				<div
					className={cn(
						buttonVariants({ variant: 'secondary' }),
						'w-full cursor-pointer'
					)}
				>
					{buttonName}
				</div>
			</Label>
			<Input
				className="hidden"
				id="file"
				type="file"
				onChange={e => {
					const file = e.target.files?.[0];
					if (!file) return;
					const filePath = `${user?.id}/${params.boardId}/${file.name}`;
					uploadFile(filePath, file);
				}}
			/>
		</>
	);
};
