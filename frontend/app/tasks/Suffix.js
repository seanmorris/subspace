import { Task } from '../Task';

export class Suffix extends Task
{
	title  = 'Sufffix Task';

	static helpText = 'Append a suffix to lines passed into STDIN.';
	static useText  = '/something | suffix SUFFIX_TEXT';

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