import { View } from 'curvature/base/View';
import { Keyboard } from 'curvature/input/Keyboard';

import { Socket } from 'kalisti/Socket';

import { BinaryMessageView } from 'BinaryMessageView';
import { TextMessageView } from 'TextMessageView';
import { ByteView } from 'ByteView';

import { Login } from 'Login';
import { Register } from 'Register';

export class RootView extends View
{
	constructor(args = {})
	{
		super(args);

		this.routes      = {};
		this.template    = require('./root.tmp');
		this.args.input  = '';
		this.args.output = [];
		this.args.passwordMode = false;

		this.localLock   = null;
		this.args.prompt = '<<';

		this.max = 1024;

		this.history = [];
		this.historyCursor = -1;

		args.output.___after___.push((t,k,o,a)=>{
			if(k === 'push')
			{
				this.onTimeout(16, ()=>{
					window.scrollTo({
						top: document.body.scrollHeight
						, left: 0
						, behavior: 'smooth'
					});
				});

				this.onTimeout(48, ()=>{
					window.scrollTo({
						top: document.body.scrollHeight
						, left: 0
						, behavior: 'smooth'
					});
				});
			}
		});

		this.socket = Socket.get(`ws://${location.hostname}:9998`);

		this.auth().then(()=>{
			this.onTimeout(10, ()=>{
				this.socket.send('motd');
				this.args.output.push(`<< motd`);
			});
		});

		this.socket.subscribe('message', (event, message, channel, origin, originId, originalChannel, packet)=>{
			if(typeof event.data == 'string')
			{
				let received = JSON.parse(event.data);

				if(typeof received == 'object')
				{
					 received = JSON.stringify(received,null,4);
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

		keyboard.keys.bindTo('Escape', (v)=>{
			if(v == 1)
			{
				if(this.localLock)
				{
					this.args.output.push(`:: Killed.`);
				}
				this.localLock = false;
				this.args.prompt = '::';
				this.args.passwordMode = false;
			}
		}, {wait: 1});

		keyboard.keys.bindTo('ArrowUp', (v)=>{
			if(v == 1)
			{
				this.historyCursor++;

				if(this.historyCursor >= this.history.length)
				{
					this.historyCursor--;
					return;
				}

				this.args.input = this.history[this.historyCursor];
			}
		}, {wait: 1});

		keyboard.keys.bindTo('ArrowDown', (v)=>{
			if(v == 1)
			{
				this.historyCursor--;

				if(this.historyCursor <= -1)
				{
					this.historyCursor++;
					this.args.input = '';
					return;
				}

				this.args.input = this.history[this.historyCursor];
			}
		}, {wait: 1});

	}

	postRender()
	{
		this.args.bindTo('passwordMode', (v)=>{
			if(v)
			{
				this.tags.input.element.style.display = 'none';
				this.tags.password.element.style.display = 'unset';
			}
			else
			{
				this.tags.input.element.style.display = 'unset';
				this.tags.password.element.style.display = 'none';				
			}

			this.focus();
		},{wait:0});
	}

	focus()
	{
		if(window.getSelection().toString())
		{
			return;
		}

		if(this.args.passwordMode)
		{
			this.tags.password.element.focus();
			return;
		}
		this.tags.input.element.focus();
	}

	interpret(command)
	{
		if(this.localLock)
		{
			this.localLock.pass(command, this);
			return;
		}

		this.history.unshift(command);
		this.historyCursor = -1;

		if(command.substring(0,1) !== '/')
		{
			this.socket.send(command);

			this.args.output.push(`<< ${command}`);

			while(this.args.output.length > this.max)
			{
				this.args.output.shift();
			}

			this.args.input = '';

			return;
		}

		// let original = command;
		this.args.output.push(`:: ${command}`);

		command  = command.substring(1);
		let args = command.split(' ');
		command  = args.shift();


		switch(command)
		{
			case 'pub':
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

			case 'login':
				this.args.output.push(':: Escape to cancel');
				this.localLock = new Login;
				this.args.prompt = '::';
				this.localLock.init(this);
				this.args.prompt = '::';
				break;

			case 'register':
				this.args.output.push(':: Escape to cancel');
				this.localLock = new Register;
				this.args.prompt = '::';
				this.localLock.init(this);
				break;

			case 'auth':
				this.auth();
				break;

			case 'clear':
				while(this.args.output.length)
				{
					this.args.output.pop();
				}
				break;

			case 'commands':
				this.args.output.push(JSON.stringify({
					'/pub': 'CHAN BYTES... Publish raw bytes to a channel (hexadecimal)'
					, '/auth': 'Run the auth proceedure'
					, '/login': 'Run the login proceedure'
					, '/register': 'Run the registration proceedure'
					, '/clear': 'Clear the terminal'
				}, null ,4));
				break;
		}

		this.args.input = '';
	}

	auth()
	{
		return fetch('/auth?api').then((response)=>{
			return response.text();
		}).then((token)=>{
			this.args.output.push(`:: /auth`);
			this.args.output.push('<< auth [token censored]');
			this.socket.send(`auth ${token}`);

			this.args.output.push('<< sub 1	');
			this.socket.send(`sub 1`);

			return true;
		});
	}

	submit(event)
	{
		console.log(event);

		event.preventDefault();

		this.interpret(this.args.input);
	}
}