import { Task } from 'subspace-console/Task';

export class CoTask extends Task
{
	title  = 'CoTask';

	static helpText = 'Run an operation in a separate thread.';
	static useText  = 'cotask';

	main(input = null)
	{
		const source = `(${(context) => {

			importScripts(context.origin + '/app.js');

			console.log( globalThis );

			importScripts(context.origin + '/curvature.js');

			const View = require('curvature/base/View').View;
			const view = View.from('html goes here');

			self.postMessage({view: String(view)});

			self.close && self.close();

		}})({
			origin: '${location.origin}'
		})`;

		const sourceBlob = new Blob([source], {type : 'text/plain'});
		const sourceUri  = URL.createObjectURL(sourceBlob);
		const thread     = new Worker(sourceUri);

		thread.addEventListener('message', event => {

			console.log(event);

		});

		this.status = 0;
	}
}
