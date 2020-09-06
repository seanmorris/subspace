import { Task } from '../Task';

export class Lower extends Task
{
	title  = 'Lowercase Task';

	static helpText = 'Transform data from STDIN to lowercase.';
	static useText  = '/something | lower';

	main(input = null)
	{
		this.status = 0;
		this.print(String(input).toLowerCase());
	}
}