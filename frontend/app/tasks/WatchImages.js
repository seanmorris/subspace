import { View } from 'curvature/base/View';
import { Task } from 'subspace-console/Task';

const Accept = Symbol('accept');

export class WatchImages extends Task
{
	title  = 'Watch Images Task';

	static helpText = 'Watch a channel for images.';
	static useText  = '/images CHAN';

	init(channel)
	{
		if(channel === undefined)
		{
			this.printErr('Please supply a channel');
			return;
		}

		this.socket = this.term.socket;

		const originalEcho = this.term.localEcho;

		const onMessage = (e,m,o,i)=>{
			console.log(m,o,i);

			this.print(`Got one.`);

			const blob = new Blob([new Uint8Array(m)]);
			const url  = URL.createObjectURL(blob);
			const view = View.from('<img cv-attr = "src:img" cv-ref = "img:curvature/base/Tag" />');

			view.postRender = () => {
				let img       = view.tags.img.element;
				let imageLoad = (event) => {
					img.removeEventListener('load', imageLoad);
					URL.revokeObjectURL(url);
				};
				img.addEventListener('load', imageLoad);
			};

			console.log(view);

			this.term.args.output.push(view);

			view.args.img = url;
		};

		this.finally(() => {
			this.socket.unsubscribe(`message:${channel}`, onMessage);
			this.term.localEcho = originalEcho
		});

		this.term.localEcho = false;

		this.socket.subscribe(`message:${channel}`, onMessage);

		this.print(`Listening for images on channel ${channel}`);

		return new Promise(accept => {
			this[Accept] = accept;
		});
	}
}
