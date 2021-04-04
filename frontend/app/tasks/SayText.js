import { Config } from 'Config';
import { Socket } from 'subspace-client/Socket';
import { Task   } from 'subspace-console/Task';

export class SayText extends Task
{
	title  = 'Publish Bytes Task';

	static helpText = 'Send bytes privately from ARGV.';
	static useText  = '/say CHANNEL_ID CC_COUNT CC_USER_ID[...] BCC_COUNT BCC_USER_ID[...] (hexadecimal)';

	main(input)
	{
		const args     = this.args;
		const channel  = args.shift();
		const data     = [];

		const ccCount  = parseInt(args.shift());
		const ccList   = args.splice(0, ccCount).map(parseInt);

		const bccCount = parseInt(args.shift());
		const bccList  = args.splice(0, bccCount).map(parseInt);

		this.term.socket.say(channel, {cc:ccList, bcc:bccList}, args.join(''));

		// this.term.socket.send(`say ${channel} ${ccCount} ${ccList.join(' ')} ${bccCount} ${bccList.join(' ')} ${args.join('')}`);
	}
}
