import { View } from './View.js';

export class Chat
{
	constructor(terminal, args)
	{
		terminal.args.output.push(new View);
	}

	pass(command)
	{

	}
}