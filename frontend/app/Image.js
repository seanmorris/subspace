import { View } from 'curvature/base/View';

export class Image
{
	constructor(terminal, args)
	{
		terminal.localEcho = false;

		this.socket = terminal.socket;

		let channel = 0;

		if(args.length)
		{
			channel = args[0];
		}

		this.socket.subscribe(`message:${channel}`,(e,m,o,i)=>{
			console.log(m,o,i);
			terminal.args.output.push(`Got one.`);
			let blob = new Blob([new Uint8Array(m)]);
			let url  = URL.createObjectURL(blob);

			let view = new View;

			view.template   = '<img cv-attr = "src:img" cv-ref = "img:curvature/base/Tag" />';

			view.postRender = () => {
				let img       = view.tags.img.element;
				let imageLoad = (event) => {
					img.removeEventListener('load', imageLoad);
					URL.revokeObjectURL(url);
				};
				img.addEventListener('load', imageLoad);
			};

			terminal.args.output.push(view);

			view.args.img = url;
		});

		terminal.args.output.push(`:: Listening for images on channel ${channel}`);
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
