export class Login
{
	init(terminal)
	{
		terminal.args.output.push(':: Please type your username');
	}

	pass(command, terminal)
	{
		terminal.args.passwordMode = false;

		if(!this.stack)
		{
			this.stack = [];
		}

		this.stack.push(command);

		if(this.stack.length == 1)
		{
			terminal.args.passwordMode = true;
			terminal.args.input = '';
			terminal.args.output.push(':: Please type your password');
			return;
		}

		if(this.stack.length == 2)
		{
			terminal.args.input = '';
			terminal.args.output.push(':: Checking...');

			terminal.localLock = false;
			terminal.args.prompt = '<<';

			terminal.socket.send(`login ${this.stack[0]} ${this.stack[1]}`);
		}
	}
}