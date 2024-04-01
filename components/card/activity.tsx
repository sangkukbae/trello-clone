import { UserRound } from 'lucide-react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-react';

export const Activity = () => {
	const { user } = useUser();
	return (
		<div className="flex flex-col gap-y-2">
			<Label className="flex justify-between items-center">
				<span className="text-base">Activity</span>
				<Button variant="secondary">Show Details</Button>
			</Label>
			<form>
				<label className="flex items-center gap-x-2">
					<Avatar className="w-8 h-8">
						<AvatarImage src={user?.imageUrl} />
						<AvatarFallback>
							<div className="w-8 h-8 rounded-full bg-secondary">
								<UserRound className="w-8 h-8" />
							</div>
						</AvatarFallback>
					</Avatar>

					<Input className="w-full" placeholder="Write a comment..." />
				</label>
			</form>
		</div>
	);
};
