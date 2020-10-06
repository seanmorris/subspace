import { Config } from 'Config';
import { Socket } from 'subspace-client/Socket';
import { Task   } from 'subspace-console/Task';

export class PublishBytes extends Task
{
	title  = 'Publish Bytes Task';

	static helpText = 'Publish bytes from ARGV.';
	static useText  = '/pub CHAN BYTE [BYTE...] (hexadecimal)';

	main(input)
	{
		const args  = this.args;
		let channel = parseInt(args.shift(), 16);
		let data    = [];

		while(args.length)
		{
			data.push(args.shift());
		}

		let channelBytes = new Uint8Array(
			new Uint16Array([channel]).buffer
		);

		let bytes = [];

		for (let i in channelBytes)
		{
			bytes[i] = channelBytes[i];
		}

		for(let i = 0; i < data.length; i++)
		{
			bytes[i + 2] = parseInt(data[i], 16);
		}

		this.term.socket.send(new Uint8Array(bytes));
	}
}
