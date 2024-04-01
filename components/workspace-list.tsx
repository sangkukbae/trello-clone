'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';
import {
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useContext } from 'react';
import { MoreContext } from './navbar';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const WorkspaceList = () => {
	const router = useRouter();
	const { setActive, organizationList, isLoaded } = useOrganizationList();
	const { organization } = useOrganization();
	const { currentMoreMenu, setCurrentMoreMenu } = useContext(MoreContext);

	if (!isLoaded) {
		return null;
	}

	if (!organization) {
		return null;
	}

	return (
		<>
			{currentMoreMenu !== 'none' && (
				<header className="relative h-10 flex justify-center items-center">
					<Button
						className="absolute top-1 left-1"
						variant="ghost"
						onClick={() => setCurrentMoreMenu('none')}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>

					<h4 className="text-sm font-bold">Workspaces</h4>
				</header>
			)}
			<DropdownMenuLabel>Current Workspace</DropdownMenuLabel>
			<DropdownMenuItem className="pointer-events-none">
				<Image
					className="mr-2"
					src={organization.imageUrl ?? ''}
					width={32}
					height={32}
					alt="workspace"
				/>
				<span>{organization.name}</span>
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuLabel>Your Workspaces</DropdownMenuLabel>
			{organizationList.map(({ organization }) => (
				<DropdownMenuItem
					className="cursor-pointer"
					key={organization.id}
					onClick={() => {
						setActive({ organization: organization.id });
						router.push(`/w/${organization.id}`);
					}}
				>
					<Link className="flex items-center" href={`/w/${organization.id}`}>
						<Image
							className="mr-2"
							src={organization.imageUrl ?? ''}
							width={32}
							height={32}
							alt="workspace"
						/>
						<span>{organization.name}</span>
					</Link>
				</DropdownMenuItem>
			))}
		</>
	);
};
