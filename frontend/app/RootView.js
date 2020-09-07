import { Config } from 'Config';
import { View } from 'curvature/base/View';
import { Socket } from 'subspace-client/Socket';
import { MeltingText } from 'view/MeltingText';

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

		this.template      = require('./root.tmp');
		this.args.input    = '';
		this.args.output   = [];
		this.args.inverted = '';
		this.localEcho     = true;
		this.postToken     = null;
		this.args.prompt   = '<<';
		
		this.args.passwordMode = false;

		this.tasks = [];

		this.max = 1024;

		this.historyCursor = -1;
		this.history       = [];

		this.env = new Map();

		args.output.___after((t, k, o, a) => {
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

		this.originalInput = '';
	}

	runCommand(command)
	{
		if(this.tasks.length)
		{
			return this.tasks[0].write(command) || Promise.resolve();
		}

		return this.interpret(command) || Promise.resolve();
	}

	runScript(url)
	{
		fetch(url + '?api=txt').then((response) => {
			return response.text();
		}).then((init) => {
			let lines = init.split("\n");

			const process = (lines) => {

				if(!lines.length)
				{
					return;
				}

				let line = lines.shift();

				if (line && line[0] == '!')
				{
					this.args.output.push(line.substring(1));
					process(lines);
				}
				else if(line)
				{
					this.runCommand(line).then(()=>process(lines));
				}
				else
				{
					process(lines);
				}
			}

			process(lines);
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
		this.history.unshift(command);
		this.historyCursor = -1;

		if(command.substring(0, 1) !== '/')
		{
			return;
		}

		command = command.substring(1);

		const commands = command.split(/\s*\|\s*/);

		this.args.output.push(`-- /${command}`);

		let task = null;
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
				task = new Path[command](args, task, this);
			}
			else
			{
				switch (command)
				{
					case 'clear': this.args.output.splice(0); break;

					case 'z':
						this.args.output.push(
							new MeltingText({ input: 'lmao!' })
						);
						break;

					case 'commands':
						for(const cmd in Path)
						{
							this.args.output.push(`?| ${cmd} - ${Path[cmd].helpText}`);
							Path[cmd].useText
							&& this.args.output.push(` | ${Path[cmd].useText}`);

							this.args.output.push(` |`);

						}
						break;
					
					default:
						this.args.output.push(`!! Bad command: ${command}`);
				}
			}
		}

		if(task)
		{
			this.args.prompt = '..';

			this.tasks.unshift(task);

			const output = (event) => this.args.output.push(`:: ${event.detail}`);
			const error  = (event) => this.args.output.push(`!! ${event.detail}`);
			
			task.addEventListener('output', output);			
			task.addEventListener('error', error);			
			
			task.execute();
			
			task.catch(error  => console.log(error));
			task.catch(error  => this.args.output.push(`!! ${error}`));
			
			task.finally(done => {
				this.args.prompt = '<<';
				task.removeEventListener('error', error);
				task.removeEventListener('output', output);
				this.tasks.shift();
			});
		}

		this.args.input = '';

		return task;
	}

	keydown(event, autocomplete)
	{
		switch(event.key)
		{
			case 'Tab': event.preventDefault(); break;
		}
	}

	keyup(event, autocomplete)
	{
		switch(event.key)
		{
			case 'ArrowDown':
				this.historyCursor--;

				if(this.historyCursor <= -1)
				{
					this.historyCursor = -1;
					this.args.input = this.originalInput;
					return;
				}

				this.args.input = this.history[this.historyCursor];

				this.onNextFrame(()=>{
					const element = this.tags.input.element;
					element.selectionStart = element.value.length;
					element.selectionEnd   = element.value.length;
				});
				break;

			case 'ArrowUp':
				if(this.historyCursor == -1)
				{
					this.originalInput = this.args.input;
				}

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
				break;

			case 'Escape': 
				if(this.tasks.length)
				{
					console.log( Task.KILL );
					
					this.tasks[0].finally(()=>this.args.output.push(
						`:: Killed.`
					));
					
					this.tasks[0].signal( Task.KILL );
					this.tasks[0].signal('kill');
				}

				this.args.prompt = '<<';
				this.args.passwordMode = false;
				break;
			
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
				this.originalInput = this.args.input = '';
				this.runCommand(command);
				break;
		}
	}

	cancel(event)
	{
		event.preventDefault();
		event.stopPropagation();
	}
}
