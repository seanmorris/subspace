import { Task } from 'subspace-console/Task';

export class Auth extends Task
{
	title  = 'Auth Task';
	prompt = '<<';

	static helpText = 'Perform token exchange to identify socket connection.';
	static useText  = '/auth';

	init()
	{
		return fetch('/auth?api').then((response) => {
			return response.text();
		}).then((token) => {
			this.print('auth [token censored]');
			this.term.socket.send(`auth ${token}`);
			return true;
		});
	}
}
