import { View } from 'curvature/base/View';
import { Keyboard } from 'curvature/input/Keyboard';

import { Socket } from 'kalisti/Socket';

import { BinaryMessageView } from 'BinaryMessageView';
import { TextMessageView } from 'TextMessageView';
import { ByteView } from 'ByteView';



export class RootView extends View
{
	constructor(args = {})
	{
		super(args);

		this.routes      = {};
		this.template    = require('./root.tmp');
		this.args.input  = '';
		this.args.output = [];

		this.max = 1024;

		args.output.___after___.push((t,k,o,a)=>{
			if(k === 'push')
			{
				this.onTimeout(10, ()=>{
					window.scrollTo(0,document.body.scrollHeight);
				});
			}
		});

		this.socket = Socket.get('ws://localhost:9999');

		this.args.output.push(`<< motd`);

		this.socket.send('motd');
		this.socket.send('help');

		// this.onTimeout(100, ()=>{
		// 	this.args.output.push(`<< sub 0`);
		// 	this.socket.send('sub 0');
		// });

		// this.onTimeout(200, ()=>{
		// 	this.args.output.push(`<< pub 0`);
		// 	this.socket.send('pub 0');
		// });

		// this.socket.subscribe('message:console', (event, message, channel, origin, originId, originalChannel, packet)=>{
		// 	console.log(JSON.parse(event.data));
		// });

		this.socket.subscribe('message', (event, message, channel, origin, originId, originalChannel, packet)=>{
			if(typeof event.data == 'string')
			{
				let received = JSON.parse(event.data);

				if(typeof received == 'object')
				{
					 received = JSON.stringify(received,null,2);
				}

				this.args.output.push(new TextMessageView({
					message: received
				}));
			}
			else if(event.data instanceof ArrayBuffer)
			{
				let bytesArray = new Uint8Array(event.data);

				let user = originId.toString(16)
					.toUpperCase()
					.padStart(4, '0');

				let channelName = channel.toString(16)
					.toUpperCase()
					.padStart(4, '0');

				let header  = `0x${user}${channelName}`;

				let headerBytes = [
					originId.toString(16)
						.toUpperCase()
						.padStart(4, '0')
					, channel.toString(16)
						.toUpperCase()
						.padStart(4, '0')
				].join('').match(/.{1,2}/g);

				let messageIndex = 6;

				if(origin == 'server')
				{
					headerBytes = [channel.toString(16).padStart(4, '0')];
					header = `0x${channel.toString(16).padStart(4, '0')}`;

					let messageIndex = 4;
				}

				let bytes = Array.from(bytesArray).map(x=>{
					return x.toString(16)
						.toUpperCase()
						.padStart(2, '0');
				});

				this.args.output.push(new BinaryMessageView({
					header:new ByteView({
						separator: ''
						, bytes:    headerBytes
					})
					, message: new ByteView({
						separator: ' '
						, bytes:   bytes.slice(messageIndex)
					})
				}));

				while(this.args.output.length > this.max)
				{
					this.args.output.shift();
				}
			}
		});

		let keyboard = new Keyboard;

		keyboard.keys.bindTo('Enter', (v)=>{
			if(v == 1)
			{
				this.interpret(this.args.input);
			}
		}, {wait: 1});


	}

	postRender()
	{
		this.focus();		
	}

	focus()
	{
		this.tags.input.element.focus();
	}

	interpret(command)
	{
		if(command.substring(0,1) !== '/')
		{
			this.socket.send(command);

			this.args.output.push(`<< ${command}`);

			while(this.args.output.length > this.max)
			{
				this.args.output.shift();
			}
		}

		command  = command.substring(1);
		let args = command.split(' ');
		command  = args.shift();

		console.log(command);

		switch(command)
		{
			case 'pub':
				console.log(args);
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

				for(let i in channelBytes)
				{
					bytes[i] = channelBytes[i];
				}

				for(let i = 0; i < data.length; i++)
				{
					bytes[i + 2] = parseInt(data[i], 16);
				}

				this.socket.send(new Uint8Array(bytes));
				break;
		}

		this.args.input = '';
	}
}