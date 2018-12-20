import { View } from 'curvature/base/View';
import { Keyboard } from 'curvature/input/Keyboard';

import { Socket } from 'kalisti/Socket';

import { BinaryMessageView } from 'BinaryMessageView';
import { TextMessageView } from 'TextMessageView';
import { ByteView } from 'ByteView';
import { MeltingText } from 'MeltingText';

import { Login } from 'Login';
import { Register } from 'Register';
import { Cornfield } from 'Cornfield';

export class RootView extends View
{
	constructor(args = {})
	{
		super(args);

		this.routes      = {};
		this.template    = require('./root.tmp');
		this.args.input  = '';
		this.args.output = [];
		this.args.inverted = '';
		this.args.passwordMode = false;
		this.localEcho = true;

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

				if(this.localEcho)
				{
					this.args.output.push(new TextMessageView({
						message: received
					}));
				}
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

				if(this.localEcho)
				{
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
				}


				while(this.args.output.length > this.max)
				{
					this.args.output.shift();
				}
			}
		});

		let keyboard = new Keyboard;

		keyboard.keys.bindTo((v,k)=>{
			if(v == 1)
			{
				// alert(k);
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
				this.args.prompt = '<<';
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

	fileLoaded(event)
	{
		if(this.fileChannel === false)
		{
			return;
		}

		let fileReader = new FileReader();
		let field      = event.target;
		let file       = event.target.files[0];

		fileReader.addEventListener('load', (event)=>{
			this.args.output.push(
				`:: Sending ${file.name}...`
			);

			if(this.fileChannel == parseInt(this.fileChannel))
			{
				this.socket.publish(
					this.fileChannel
					, new Uint8Array(
						event.target.result
					)
				);
			}
			else
			{
				console.log(event.target);
				this.socket.publish(
					this.fileChannel
					, (new TextDecoder("utf-8")).decode(
						event.target.result
					)
				);
			}

			this.fileChannel = false;
			field.value = '';
		});

		fileReader.readAsArrayBuffer(file)
	}

	focus(event)
	{
		if(event && event.target.name == 'INPUT')
		{
			return;
		}

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

	submit(event)
	{
		this.interpret(this.args.input);
	}

	interpret(command)
	{
		if(this.localLock)
		{
			if(command == '/quit')
			{
				this.localLock = false;
				this.args.prompt = '<<';
				this.args.output.push(`:: Killed.`);
				this.args.input = '';
				return;
			}
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

			case 'echo':
				if(args.length)
				{
					this.localEcho = parseInt(args[0]);
				}
				this.args.output.push(`Echo is ${this.localEcho?'on':'off'}`);
				break;

			case 'cornfield':
				this.localLock = new Cornfield(this);
				this.args.prompt = '::';
				break;

			case 'light':
				this.args.inverted = 'inverted';
				break;

			case 'dark':
				this.args.inverted = '';
				break;


			case 'file':
				if(!args.length)
				{
					this.args.output.push(
						`:: Error: Please supply a channel to publish file.`
					);
					break;
				}
				this.fileChannel = args[0];
				this.tags.file.element.click();
				break;

			case 'z':
				this.args.output.push(
					new MeltingText({input:'lmao!'})
				);
				break;

			case 'commands':
				this.args.output.push(JSON.stringify({
					'/pub': 'CHAN BYTES... Publish raw bytes to a channel (hexadecimal)'
					, '/auth': 'Run the auth procedure.'
					, '/login': 'Run the login procedure.'
					, '/register': 'Run the registration procedure.'
					, '/clear': 'Clear the terminal.'
					, '/echo': '[1|0] Enable/Disable/Check localEcho.'
					, '/light': 'Light theme.'
					, '/dark': 'Dark theme.'
					, '/cornfield': 'Play Cornfield.'
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

			return true;
		});
	}

	test(event)
	{
		if(event.key == 'Enter')
		{
			let command = this.args.input;
			this.args.input = '';
			this.onTimeout(0, ()=>{
				this.interpret(command);
			});
		}
	}
}