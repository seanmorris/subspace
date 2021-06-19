import { Task } from 'subspace-console/Task';

export class Parse extends Task
{
	title  = 'Parse Task';

	static helpText = 'Test the curvature parser.';
	static useText  = '/something | parse';

	main(input = null)
	{
		this.status = 0;

		this.print(String(input).toUpperCase());
	}
}
