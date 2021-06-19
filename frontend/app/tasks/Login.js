import { Config } from 'Config';
import { Socket } from 'subspace-client/Socket';
import { Task   } from 'subspace-console/Task';

const Accept = Symbol('accept');

export class Login extends Task
{
	title  = 'Login Task';

	static helpText = 'Login.';
	// static useText  = '';

	init()
	{
		this.print('Please type your username');

		return new Promise(accept => {
			this[Accept] = accept;
		});
	}

	main(command)
	{
		const terminal = this.term;

		terminal.args.passwordMode = false;

		if(!this.stack)
		{
			this.stack = [];
		}

		if(!command)
		{
			return;
		}

		this.stack.push(command);

		if(this.stack.length == 1)
		{
			terminal.args.passwordMode = true;
			terminal.args.input = '';
			terminal.args.output.push(':: Please type your password [censored]');
			return;
		}

		if(this.stack.length == 2)
		{
			terminal.args.input = '';
			terminal.localLock = false;
			terminal.args.prompt = '<<';

			terminal.args.output.push(`<< login ${this.stack[0]} [password censored]`);
			terminal.socket.send(`login ${this.stack[0]} ${this.stack[1]}`);
			terminal.args.output.push(':: Checking...');

			this[Accept]();
		}
	}
}
