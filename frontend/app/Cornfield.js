export class Cornfield
{
	constructor(terminal)
	{
		terminal.args.output.push(':: Welcome to Cornfield');
		terminal.args.output.push(':: You are in a cornfield.');
		terminal.args.output.push(':: You see corn.');
		terminal.args.output.push(':: Move? [north south east west]');
		terminal.args.output.push(':: Look?');
	}

	pass(command, terminal)
	{
		command = command.toLowerCase();

		switch(command)
		{
			case 'look':
				terminal.args.output.push(':: You found an ear of corn.');
				break;
			case 'n':
			case 'north':
				terminal.args.output.push(':: You moved north.');
				break;
			case 's':
			case 'south':
				terminal.args.output.push(':: You moved south.');
				break;
			case 'e':
			case 'east':
				terminal.args.output.push(':: You moved east.');
				break;
			case 'w':
			case 'west':
				terminal.args.output.push(':: You moved west.');
				break;
		}

		terminal.args.input = '';
	}
}