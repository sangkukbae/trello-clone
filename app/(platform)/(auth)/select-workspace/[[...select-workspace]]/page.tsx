import { OrganizationList } from '@clerk/nextjs';

export default function CreateOrganizationPage() {
	return (
		<OrganizationList
			hidePersonal
			afterSelectOrganizationUrl="/w/:id"
			afterCreateOrganizationUrl="/w/:id"
		/>
	);
}
