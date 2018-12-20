import { View } from 'curvature/base/View';

export class Image
{
	constructor(terminal)
	{
		terminal.args.output.push(':: Listening for images on channel 0xFF');

		terminal.localEcho = false;

		this.socket = terminal.socket;

		this.socket.subscribe('message:255',(e,m,o,i)=>{
			console.log(m);
			terminal.args.output.push(`Got one.`);
			let blob = new Blob([new Uint8Array(m)]);
			let url  = URL.createObjectURL(blob);

			let view = new View;

			view.template   = '<img cv-attr = "src:image" />';
			view.args.image = url;

			terminal.args.output.push(view);
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
		}

		terminal.args.input = '';
	}
}
