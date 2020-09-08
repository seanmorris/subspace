import { Config } from 'Config';
import { Socket } from 'subspace-client/Socket';
import { Task } from 'subspace-console/Task';

const Accept = Symbol('accept');

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
