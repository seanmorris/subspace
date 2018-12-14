import { View } from 'curvature/base/View';
import { Keyboard } from 'curvature/input/Keyboard';

import { Socket } from 'kalisti/Socket';

export class RootView extends View
{
	constructor(args = {})
	{
		super(args);

		this.routes      = {};
		this.template    = require('./root.tmp');
		this.args.input  = '';
		this.args.output = [];

		this.socket      = Socket.get('ws://localhost:9999');

		this.socket.subscribe('message', (event, message, channel, origin, originId, originalChannel, packet)=>{
			if(typeof event.data == 'string')
			{
				this.args.output.push(event.data);
			}
			else if(event.data instanceof ArrayBuffer)
			{
				let bytesArray = new Uint8Array(event.data);

				console.log(bytesArray);

				let user = originId.toString(16)
					.toUpperCase()
					.padStart(4, '0');

				let channelName = channel.toString(16)
					.toUpperCase()
					.padStart(4, '0');
				let header  = `0x${user}${channelName}`;

				if(origin == 'server')
				{
					header = `0x${channel}`;
				}

				let bytes = Array.from(bytesArray).map(x=>{
					return x.toString(16)
						.toUpperCase()
						.padStart(2, '0');
				});

				this.args.output.push(
					`>> ${header}`
					+ " "
					+ bytes.join(' ')
				);
			}

		});

		let keyboard = new Keyboard;

		keyboard.keys.bindTo('Enter', (v)=>{
			if(v == 1)
			{
				this.socket.send(this.args.input);
				

				this.args.input = '';
			}
		}, {wait: 0});
	}
}