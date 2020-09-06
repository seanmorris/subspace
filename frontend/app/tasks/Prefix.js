import { Task } from '../Task';

export class Prefix extends Task
{
	title  = 'Prefix Task';

	static helpText = 'Prepend a prefix to lines passed into STDIN.';
	static useText  = '/something | prefix PREFIX_TEXT';

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
