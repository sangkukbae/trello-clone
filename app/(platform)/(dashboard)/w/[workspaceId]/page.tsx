import { getBoards } from '@/app/actions';
import { Separator } from '@/components/ui/separator';
import { WorkspaceInfo } from '@/components/workspace-info';
import { BoardList } from '@/components/board-list';

export default async function WorkspacePage() {
	const boards = (await getBoards()) ?? [];

	return (
		<div className="w-full h-full">
			<WorkspaceInfo />
			<div className="px-8">
				<Separator />
			</div>
			<BoardList boards={boards} />
		</div>
	);
}
