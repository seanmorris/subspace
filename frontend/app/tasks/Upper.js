import { Task } from '../Task';

export class Upper extends Task
{
	title  = 'Uppercase Task';

	main(input = null)
	{
		this.status = 0;
		this.print(String(input).toUpperCase());
	}
}