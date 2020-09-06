import { Task } from '../Task';

export class Suffix extends Task
{
	title  = 'Sufffix Task';

	init(content)
	{
		this.content = content;
	}

	main(input = null)
	{
		this.status = 0;
		this.print(String(input) + ' ' + (this.content || 'Suffix.'));
	}
}