import { useContext } from 'react';
import { Plus } from 'lucide-react';

import { CardContext } from '.';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LabelPicker } from './label-picker';
import { colorClasses } from '@/lib/constants';

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
										className={cn('w-fit min-w-12', colorClasses[color])}
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
