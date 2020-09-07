import { Task } from '../Task';

export class Auth extends Task
{
	title  = 'Auth Task';

	static helpText = 'Perform token exchange to identify socket connection.';
	static useText  = '/auth';

	init()
	{
		return fetch('/auth?api').then((response) => {

			return response.text();
		
		}).then((token) => {
			// this.args.output.push(`:: /auth`);
			// this.print('<< auth [token censored]');			
			this.term.socket.send(`auth ${token}`);

			return true;
		});
	}

	main(command)
	{
		if(!command)
		{
			return;
		}

		console.log(command);

		if(command.substring(0, 1) === '/')
		{
			this.term.interpret(command);
		}
		else
		{
			this.term.socket.send(command);
		}
	}
}
