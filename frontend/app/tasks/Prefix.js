import { Task } from '../Task';

export class Prefix extends Task
{
	title  = 'Prefix Task';

	init(content)
	{
		this.content = content;
	}

	main(input = null)
	{
		this.status = 0;
		this.print((this.content || 'Prefix.') + ' ' + String(input));
	}
}