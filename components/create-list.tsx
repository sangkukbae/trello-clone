'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useParams } from 'next/navigation';
import { createList } from '@/app/actions';
import { toast } from 'sonner';

export const CreateList = () => {
	const params = useParams();
	const [title, setTitle] = useState('');
	const [isEditing, setIsEditing] = useState(false);

	const handleSubmit = async () => {
		// Early return if the title is empty or only contains whitespace
		const trimmedTitle = title.trim();
		if (trimmedTitle === '') {
			toast.warning('Please enter a valid title.');
			return;
		}

		try {
			const isCreated = await createList({
				title: trimmedTitle,
				boardId: params.boardId as string,
			});

			if (isCreated) {
				toast.success(`List "${trimmedTitle}" created!`);
				setTitle(''); // Clear the title input field
				setIsEditing(false); // Optionally reset editing state
			} else {
				// Considered a controlled failure where API responded but list creation failed
				toast.error('Failed to create list. Please try again.');
			}
		} catch (error) {
			console.error('Error creating list:', error);
			// Handle unexpected errors, for example, network issues or server errors
			toast.error('An unexpected error occurred. Please try again.');
		}
	};
	return (
		<div className="w-[272px]" onMouseDown={e => e.stopPropagation()}>
			{isEditing ? (
				<Card className="p-2 w-full space-y-2">
					<form
						onSubmit={e => {
							e.preventDefault();
							handleSubmit();
						}}
					>
						<Input
							value={title}
							onChange={e => setTitle(e.target.value)}
							placeholder="Enter list title..."
							autoFocus
							spellCheck={false}
						/>
					</form>

					<div className="inline-flex items-center gap-x-2">
						<Button onClick={() => handleSubmit()}>Add list</Button>
						<Button variant="ghost" onClick={() => setIsEditing(false)}>
							<X className="w-4 h-4 " />
						</Button>
					</div>
				</Card>
			) : (
				<Button
					className="w-full h-10 justify-start"
					onClick={() => setIsEditing(true)}
				>
					<Plus className="w-4 h-4 mr-2" />
					<span>Add a list</span>
				</Button>
			)}
		</div>
	);
};
