import { useContext } from 'react';
import { Plus } from 'lucide-react';

import { CardContext } from '.';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LabelPicker } from './label-picker';

export const Labels = () => {
	const { labels, setCurrentLabel } = useContext(CardContext);
	return (
		<>
			{labels.some(({ checked }) => checked) && (
				<div className="flex flex-col gap-y-2">
					<Label className="text-xs">Labels</Label>
					<div className="flex items-center gap-x-2">
						{labels
							.filter(({ checked }) => checked)
							.map(({ color, title }) => (
								<LabelPicker key={color}>
									<Button
										className={cn('w-fit min-w-12', {
											'bg-red-700 hover:bg-red-800': color === 'red',
											'bg-orange-700 hover:bg-orange-800': color === 'orange',
											'bg-yellow-700 hover:bg-yellow-800': color === 'yellow',
											'bg-green-700 hover:bg-green-800': color === 'green',
											'bg-blue-700 hover:bg-blue-800': color === 'blue',
											'bg-indigo-700 hover:bg-indigo-800': color === 'indigo',
											'bg-purple-700 hover:bg-purple-800': color === 'purple',
										})}
										variant="secondary"
										onClick={() => setCurrentLabel(color)}
									>
										{title}
									</Button>
								</LabelPicker>
							))}
						<LabelPicker>
							<Button variant="secondary">
								<Plus className="w-4 h-4" />
							</Button>
						</LabelPicker>
					</div>
				</div>
			)}
		</>
	);
};
