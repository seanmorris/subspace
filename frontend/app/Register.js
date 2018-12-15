export class Register
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
			terminal.args.input = '';
			terminal.args.output.push(':: Please type your email address');
			return;
		}

		if(this.stack.length == 2)
		{
			terminal.args.passwordMode = true;
			terminal.args.input = '';
			terminal.args.output.push(':: Please type your password');
			return;
		}

		if(this.stack.length == 3)
		{
			terminal.args.passwordMode = true;
			terminal.args.input = '';
			terminal.args.output.push(':: Please type your password again.');
			return;
		}

		if(this.stack.length == 4)
		{
			terminal.args.input = '';
			
			if(this.stack[2] !== this.stack[3])
			{
				terminal.args.output.push(':: Password verification failed.');
				terminal.args.output.push(':: Please type your password');
				terminal.args.passwordMode = true;
				this.stack.pop();
				this.stack.pop();
				return;
			}

			terminal.args.output.push(`:: Trying to register ${this.stack[0]} <${this.stack[1]}>...`);

			terminal.args.output.push(`<< register ${this.stack[0]} [password censored] ${this.stack[1]}`);	
			terminal.socket.send(`register ${this.stack[0]} ${this.stack[2]} ${this.stack[1]}`);

			terminal.localLock = false;
			terminal.args.prompt = '<<';

			// terminal.socket.send(`login ${this.stack[0]} ${this.stack[1]}`);
		}
	}
}