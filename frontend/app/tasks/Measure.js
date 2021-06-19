import { View } from 'curvature/base/View';
import { Task } from 'subspace-console/Task';

export class Measure extends Task
{
	title  = 'AudioTask';
	prompt = '..';

	static helpText = 'Measure the width of the console.';
	static useText  = 'measure';

	init(...args)
	{
		const ticker = View.from('[[fill]]');

		ticker.addEventListener('attached', event => {

			const onResize = entries => entries.forEach(entry => {

				ticker.args.w = entry.contentRect.width;

				console.log(entry, entry.contentRect);

			});

			const observer = new ResizeObserver(onResize);
			const node     = event.detail.node;

			observer.observe(node);
		});

		this.print(ticker);

		ticker.args.fill = '-';

		ticker.onInterval(16, () => ticker.args.fill.length < 400 && (ticker.args.fill += '+'));

		return new Promise(accept => setTimeout(()=>{

			accept();

		}, 5000) );
	}
}
