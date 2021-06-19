import { Config }            from 'Config';
import { Socket }            from 'subspace-client/Socket';

import { ByteView }          from '../view/ByteView';
import { TextMessageView }   from '../view/TextMessageView';
import { BinaryMessageView } from '../view/BinaryMessageView';

import { Task } from 'subspace-console/Task';

const Accept = Symbol('accept');

export class Connection extends Task
{
	title  = 'Websocket Connection Task';
	prompt = '..';

	static helpText = 'Connect to a websocket.';
	static useText  = '/connect SERVER';

	init(...args)
	{
		this.socket = Socket.get(Config.socketHost, true);

		this.term.socket = this.socket;

		this.term.env.set('socket', this.socket);

		this.socket.subscribe('close', (event) => {
			this.term.args.output.push(`Disconnected!`);
			this.term.args.output.push(`Reinitializing in ${Config.reconnect/1000 || 3}s...`);

			if(this.recon)
			{
				this.clearTimeout(this.recon);
				this.recon = false;

			}
			else
			{
				this.recon = setTimeout(
					() => {
						this.recon = false;
						this.term.runScript('/bounce_rc');
					}
					, Config.reconnect || 3000
				);
			}
		});

		this.socket.subscribe('open', () => {
			this.term.runScript('/open_rc');
			this.prompt = '<<';
		});

		this.socket.subscribe('message', (event, message, channel, origin, originId, originalChannel, packet) => {

			if(!this.term.localEcho)
			{
				return;
			}

			if(typeof event.data == 'string')
			{
				let received = JSON.parse(event.data);

				if(received.token && received.you == true)
				{
					this.term.postToken = received.token;
				}

				if(typeof received == 'object')
				{
					received = JSON.stringify(received, null, 4);
				}

				// const messageView = new TextMessageView({message: received})

				// messageView.preserve = true;

				// this.finally(()=>messageView.remove());

				this.term.write(received);
			}
			else if (event.data instanceof ArrayBuffer)
			{
				let bytesArray = new Uint8Array(event.data);

				let user = originId.toString(16)
					.toUpperCase()
					.padStart(4, '0');

				let channelName = channel.toString(16)
					.toUpperCase()
					.padStart(4, '0');

				let header = `0x${user}${channelName}`;

				let headerBytes = [
					originId.toString(16)
					.toUpperCase()
					.padStart(4, '0'), channel.toString(16)
					.toUpperCase()
					.padStart(4, '0')
				].join('').match(/.{1,2}/g);

				let messageIndex = 6;

				if(origin == 'server')
				{
					headerBytes = [channel.toString(16).padStart(4, '0')];
					header = `0x${channel.toString(16).padStart(4, '0')}`;
				}

				let bytes = Array.from(bytesArray).map(x => {
					return x.toString(16)
						.toUpperCase()
						.padStart(2, '0');
				});

				const messageView = new BinaryMessageView({
					header: new ByteView({
						separator: '',
						bytes: headerBytes
					}),

					message: new ByteView({
						separator: ' ',
						bytes: bytes.slice(messageIndex)
					})
				});

				messageView.preserve = true;

				this.finally(()=>messageView.remove());

				this.term.args.output.push(messageView);
			}
		});

		return new Promise(accept => {
			this[Accept] = accept;
		});
	}

	main(command)
	{
		if(!command)
		{
			return;
		}

		if(this.socket)
		{
			this.prompt = '<<';
			this.socket.send(command);
			return Promise.resolve();
		}
	}
}
