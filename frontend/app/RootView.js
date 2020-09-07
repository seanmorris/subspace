import { Config } from 'Config';
import { View } from 'curvature/base/View';
import { Keyboard } from 'curvature/input/Keyboard';

import { Socket } from 'subspace-client/Socket';

import { BinaryMessageView } from 'BinaryMessageView';
import { TextMessageView } from 'TextMessageView';
import { ByteView } from 'ByteView';
import { MeltingText } from 'MeltingText';

// import { Login } from 'Login';
// import { Register } from 'Register';
import { Cornfield } from 'Cornfield';
import { Chat } from 'chat/Chat';

import { Mixin } from 'curvature/base/Mixin';

import { Task } from './Task';
import { Upper } from './tasks/Upper';
import { Prefix } from './tasks/Prefix';
import { Suffix } from './tasks/Suffix';
import { Countdown } from './tasks/Countdown';

import { Path } from './Path';

export class RootView extends View {
	constructor(args = {})
	{
		super(args);

		this.routes = {};
		this.template = require('./root.tmp');
		this.args.input = '';
		this.args.output = [];
		this.args.inverted = '';
		this.args.passwordMode = false;
		this.localEcho = true;
		this.postToken = null;

		this.localLock = null;
		this.args.prompt = '<<';

		this.currentTask = false;

		this.max = 1024;

		this.history = [];
		this.historyCursor = -1;

		args.output.___after___.push((t, k, o, a) => {
			if (k === 'push') {
				this.onTimeout(16, () => {
					window.scrollTo({
						top: document.body.scrollHeight,
						left: 0,
						behavior: 'smooth'
					});
				});

				this.onTimeout(48, () => {
					window.scrollTo({
						top: document.body.scrollHeight,
						left: 0,
						behavior: 'smooth'
					});
				});
			}
		});

		this.runScript('/init_rc');

		let keyboard = new Keyboard;

		keyboard.keys.bindTo((v, k) => {
			if (v == 1) {
				// alert(k);
				// console.log(k)
			}
		});

		keyboard.keys.bindTo('Escape', (v) => {
			if (v == 1)
			{
				console.log( Task );
				if(this.currentTask)
				{
					console.log( Task.KILL );
					this.currentTask.finally(()=>this.args.output.push(`:: Killed.`));
					this.currentTask.signal( Task.KILL );
					this.currentTask.signal('kill');
				}

				if (this.localLock)
				{
					this.args.output.push(`:: Killed.`);
				}
				this.localLock = false;
				this.args.prompt = '<<';
				this.args.passwordMode = false;
			}
		});

		keyboard.keys.bindTo('ArrowUp', (v) => {
			if (v == 1) {
				this.historyCursor++;

				if (this.historyCursor >= this.history.length) {
					this.historyCursor--;
					return;
				}

				this.args.input = this.history[this.historyCursor];

				this.onNextFrame(()=>{
					const element = this.tags.input.element;
					element.selectionStart = element.value.length;
					element.selectionEnd   = element.value.length;
				});
			}
		});

		keyboard.keys.bindTo('ArrowDown', (v) => {
			if (v == 1) {
				this.historyCursor--;

				if (this.historyCursor <= -1) {
					this.historyCursor++;
					this.args.input = '';
					return;
				}

				this.args.input = this.history[this.historyCursor];

				this.onNextFrame(()=>{
					const element = this.tags.input.element;
					element.selectionStart = element.value.length;
					element.selectionEnd   = element.value.length;
				});
			}
		});
	}

	runScript(url)
	{
		fetch(url + '?api=txt').then((response) => {
			return response.text();
		}).then((init) => {
			let lines = init.split("\n");

			for(let i in lines)
			{
				let line = lines[i];

				if (line[0] == '!')
				{
					this.args.output.push(line.substring(1));
				}
				else
				{
					if(!line)
					{
						continue;
					}
					this.interpret(line);
				}
			}
		});
	}

	postRender()
	{
		this.args.bindTo('passwordMode', (v) => {
			if (v) {
				this.tags.input.element.style.display = 'none';
				this.tags.password.element.style.display = 'unset';
			} else {
				this.tags.input.element.style.display = 'unset';
				this.tags.password.element.style.display = 'none';
			}

			this.focus();
		}, { wait: 0 });
	}

	focus(event)
	{
		if (event && event.target.name == 'INPUT') {
			return;
		}

		if (window.getSelection().toString()) {
			return;
		}

		if (this.args.passwordMode) {
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

			if(this.localLock)
			{
				console.log(this.localLock);
				this.localLock.pass(command, this);
			}

			return;
		}

		this.history.unshift(command);
		this.historyCursor = -1;

		if(command.substring(0, 1) !== '/')
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

		command = command.substring(1);

		const commands = command.split(/\s*\|\s*/);

		this.args.output.push(`-- /${command}`);

		let chained = null;
		let topTask = null;

		for(const commandString of commands)
		{
			const args = commandString.trim().split(' ');
			const command = args.shift().trim();

			if(command.substr(-1) == "?")
			{
				command = command.substr(0, command.length - 1);

				if(command in Path)
				{
					this.args.output.push(`?? ${Path[command].helpText}`);
					this.args.output.push(`?? ${Path[command].useText}`);	
				}

				continue;
			}

			if(command in Path)
			{
				chained = new Path[command](args, chained, this);
				continue;
			}

			switch (command) {

				case 'auth':
					this.auth();
					break;

				case 'clear':
					while (this.args.output.length) {
						this.args.output.pop();
					}
					break;

				case 'echo':
					if (args.length) {
						this.localEcho = parseInt(args[0]);
					}
					this.args.output.push(`Echo is ${this.localEcho?'on':'off'}`);
					break;


				case 'light':
					this.args.inverted = 'inverted';
					break;

				case 'dark':
					this.args.inverted = '';
					break;

				// case 'cornfield':
				// 	this.localLock = new Cornfield(this);
				// 	this.args.prompt = '::';
				// 	break;

				case 'z':
					this.args.output.push(
						new MeltingText({ input: 'lmao!' })
					);
					break;

				case 'commands':
					this.args.output.push(JSON.stringify({
						'/pub': 'CHAN BYTES... Publish raw bytes to a channel (hexadecimal)',
						'/auth': 'Run the auth procedure.',
						'/login': 'Run the login procedure.',
						'/register': 'Run the registration procedure.',
						'/clear': 'Clear the terminal.',
						'/echo': '[1|0] Enable/Disable/Check localEcho.',
						'/light': 'Light theme.',
						'/dark': 'Dark theme.',
						'/cornfield': 'Play Cornfield.'
					}, null, 4));
					break;

				case 'connect':
					this.socket = Socket.get(Config.socketHost, true);

					this.socket.subscribe('close', (event) => {
						console.log('Disconnected!');
						this.args.output.push(`:: Disconnected!`);
						this.args.output.push(`:: Reinitializing in 5s...`);

						if (this.recon) {
							this.clearTimeout(this.recon);

							this.recon = false;
						} else {
							this.recon = this.onTimeout(5000, () => {
								this.recon = false;
								this.runScript('/bounce_rc');
							});
						}
					});

					this.socket.subscribe('open', () => {
						this.runScript('/open_rc');
					});

					this.socket.subscribe('message', (event, message, channel, origin, originId, originalChannel, packet) => {
						if (typeof event.data == 'string') {
							let received = JSON.parse(event.data);

							if (received.token && received.you == true) {
								this.postToken = received.token;
							}

							if (typeof received == 'object') {
								received = JSON.stringify(received, null, 4);
							}

							if (this.localEcho) {
								this.args.output.push(new TextMessageView({
									message: received
								}));
							}
						} else if (event.data instanceof ArrayBuffer) {
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

							if (origin == 'server') {
								headerBytes = [channel.toString(16).padStart(4, '0')];
								header = `0x${channel.toString(16).padStart(4, '0')}`;

								let messageIndex = 4;
							}

							let bytes = Array.from(bytesArray).map(x => {
								return x.toString(16)
									.toUpperCase()
									.padStart(2, '0');
							});

							if (this.localEcho) {
								this.args.output.push(new BinaryMessageView({
									header: new ByteView({
										separator: '',
										bytes: headerBytes
									}),
									message: new ByteView({
										separator: ' ',
										bytes: bytes.slice(messageIndex)
									})
								}));
							}


							while (this.args.output.length > this.max) {
								this.args.output.shift();
							}
						}
					});
					break;

				case 'ajaxSay':
					const formData = new FormData();
					const ccCount  = args.shift();
					const ccList   = args.splice(0, ccCount);
					const bccCount = args.shift();
					const bccList  = args.splice(0, bccCount);

					formData.append('cc',  ccList.join(','));
					formData.append('bcc', bccList.join(','));

					console.log(ccList, bccList);
				case 'ajaxPub':
					if (!this.postToken) {
						this.args.output.push(`:: Please aquire a POST token first.`);
					}
					else {
						this.args.output.push(`:: ${this.postToken}`);

						const _formData = formData || new FormData();

						_formData.append('token',   this.postToken);
						_formData.append('channel', args.shift());
						_formData.append('message', args.join(' '));

						console.log(_formData);

						fetch('/post', {
							method: 'post'
							, body: _formData
						}).then((response)=>{
							console.log(response);
						});
					}
					break;
			}

			if(chained)
			{
				const error  = (event) => this.args.output.push(`!! ${event.detail}`);

				chained.addEventListener('error', error);

				chained.finally(done => {
					chained.removeEventListener('error', error);
				});
			}
		}

		if(chained)
		{
			this.args.prompt = '..';

			this.currentTask = chained;

			const output = (event) => this.args.output.push(`:: ${event.detail}`);
			const error  = (event) => this.args.output.push(`!! ${event.detail}`);
			
			chained.addEventListener('output', output);			
			chained.addEventListener('error', error);			
			
			chained.execute().then(exitCode => console.log(exitCode));
			chained.catch(error  => this.args.output.push(`!! ${error}`));
			chained.finally(() => this.args.prompt = '<<');

			chained.finally(done => {
				chained.removeEventListener('output', output);
				chained.removeEventListener('error', error);
				this.currentTask = false;
				this.args.prompt = '<<';
			});
		}

		this.args.input = '';
	}

	auth()
	{
		return fetch('/auth?api').then((response) => {

			return response.text();
		
		}).then((token) => {
			// this.args.output.push(`:: /auth`);
		
			this.args.output.push('<< auth [token censored]');
			
			this.socket.send(`auth ${token}`);

			return true;
		});
	}

	keydown(event, autocomplete)
	{
		switch(event.key)
		{
			case 'Tab':

				event.preventDefault();

			break;
		}
	}

	keyup(event, autocomplete)
	{
		switch(event.key)
		{
			case 'Tab':

				event.preventDefault();

				if(!this.args.input || this.args.input[0] !== '/')
				{
					break;
				}

				const search = this.args.input.substr(1);

				for(const cmd in Path)
				{
					if(cmd.length < search.length)
					{
						continue;
					}
					
					if(search === cmd.substr(0, search.length))
					{
						this.args.input = '/' + cmd;
						break;
					}
				}

				break;

			case 'Enter':
				let command = this.args.input;
				this.args.input = '';
				this.onTimeout(0, () => {

					if(this.currentTask)
					{
						this.currentTask.write(command);
						return;
					}

					this.interpret(command);
				});
				break;
		}
	}

	cancel(event) {
		event.preventDefault();
		event.stopPropagation();
	}
}