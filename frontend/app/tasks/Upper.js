import { Task } from 'subspace-console/Task';

export class Upper extends Task
{
	title  = 'Uppercase Task';

	static helpText = 'Transform data from STDIN to uppercase.';
	static useText  = '/something | upper';

	main(input = null)
	{
		this.status = 0;
		this.print(String(input).toUpperCase());
	}
}
