export class Cornfield
{
	constructor(terminal)
	{
		terminal.args.output.push(':: Welcome to Cornfield');
		terminal.args.output.push(':: You are in a cornfield.');
		terminal.args.output.push(':: You see corn.');
		terminal.args.output.push(':: Move? [north south east west]');
		terminal.args.output.push(':: Look?');

		terminal.localEcho = false;

		this.socket = terminal.socket;

		this.socket.subscribe('message:cornfield:game',(e,m,o,i)=>{

		});

		this.socket.subscribe('message:cornfield:chat', (e,m,c,o,i)=>{
			terminal.args.output.push(`!! <${i}> ${m}`);
		});

		this.socket.subscribe('message:cornfield:users:ping', (e,m,o,i)=>{
			this.socket.publish('cornfield:users:pong', 'pong!');
		});

		this.socket.subscribe('message:cornfield:users:pong', (e,m,o,i)=>{
		});
	}

	pass(input, terminal)
	{
		let args    = input.split(' ');
		let command = args.shift();
		console.log(command);

		switch(command.toLowerCase())
		{
			case 'ping':
				this.socket.publish('cornfield:users:ping', 'ping!');
				break;

			case 'look':
				terminal.args.output.push(':: You found an ear of corn.');
				this.socket.publish('cornfield:game', 'l');
				break;

			case 'n':
			case 'north':
				terminal.args.output.push(':: You moved north.');
				this.socket.publish('cornfield:game', 'n');
				break;

			case 's':
			case 'south':
				terminal.args.output.push(':: You moved south.');
				this.socket.publish('cornfield:game', 's');
				break;

			case 'e':
			case 'east':
				terminal.args.output.push(':: You moved east.');
				this.socket.publish('cornfield:game', 'e');
				break;

			case 'w':
			case 'west':
				terminal.args.output.push(':: You moved west.');
				this.socket.publish('cornfield:game', 'w');
				break;

			case 't':
			case 'talk':
			case 'say':
				// let chatMessage = 'ok';
				let chatMessage = args.join(' ');
				terminal.args.output.push(`!! <you> ${chatMessage}`);
				this.socket.publish('cornfield:chat', chatMessage);
				break;
		}

		terminal.args.input = '';
	}
}
