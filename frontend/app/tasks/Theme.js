import { Task } from 'subspace-console/Task';

export class Theme extends Task
{
	title  = 'Theme Task';

	static helpText = 'Change the current theme.';
	static useText  = '/theme';

	init(themeName)
	{
		this.term.args.inverted = this.term.args.inverted
			? ''
			: 'inverted';
	}
}
