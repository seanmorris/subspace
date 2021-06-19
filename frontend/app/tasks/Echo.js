import { Task } from 'subspace-console/Task';

export class Echo extends Task
{
	title  = 'Echo Task';

	static helpText = 'Print a string back to the terminal.';
	static useText  = '/echo input string';

	init(...input)
	{
		this.print(input.join(' '));
	}

	main(input)
	{
		input && this.print(input);
	}
}
