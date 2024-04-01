import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function page() {
	const { userId, orgId } = auth();

	if (!userId) redirect('/sign-in');

	if (!orgId) redirect('/select-workspace');

	if (userId && orgId) redirect(`/w/${orgId}`);

	return null;
}
