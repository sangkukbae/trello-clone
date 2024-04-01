import { useOrganization } from '@clerk/nextjs';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const formSchema = z.object({
	email: z.string().email({
		message: 'Please enter a valid email address',
	}),
});

export const InviteForm = () => {
	const { organization } = useOrganization();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const invitation = await organization?.inviteMember({
			emailAddress: values.email,
			role: 'org:member',
		});

		if (invitation) {
			toast.success(`Invitation sent to "${values.email}"`);
		} else {
			toast.error('Failed to send invitation');
		}

		form.reset();
	};

	return (
		<Form {...form}>
			<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									type="text"
									placeholder="Email address or name"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button className="w-full mr-auto" type="submit">
					Send Invite
				</Button>
			</form>
		</Form>
	);
};
