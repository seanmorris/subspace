import { View } from 'curvature/base/View';
import { Task } from 'subspace-console/Task';

const Accept = Symbol('accept');

export class Raw extends Task
{
	title  = 'Watch Images Task';

	static helpText = 'Watch a channel for images.';
	static useText  = '/images CHAN';

	init(channel)
	{
		if(channel === undefined)
		{
			this.printErr('Please supply a channel');
			return;
		}

		this.socket = this.term.socket;

		const originalEcho = this.term.localEcho;

		const onMessage = (e,m,o,i) => this.print(m);

		this.finally(() => {
			this.socket.unsubscribe(`message:${channel}`, onMessage);
			this.term.localEcho = originalEcho
		});

		this.term.localEcho = false;

		this.socket.subscribe(`message:${channel}`, onMessage);

		this.print(`Listening for messages on channel ${channel}`);

		return new Promise(accept => this[Accept] = accept);
	}
}
