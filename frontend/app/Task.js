import { Bindable    } from 'curvature/base/Bindable';
import { Mixin       } from 'curvature/base/Mixin';
import { Target      } from './mixin/Target';
import { TaskSignals } from './TaskSignals';

let taskId = 0;

const target  = Symbol('target');
const Accept  = Symbol('accept');
const Reject  = Symbol('reject');
const Execute = Symbol('execute');

export class Task extends Mixin.with(Target, TaskSignals)
{
	title = 'Generic Task';

	constructor(args = [], prev = null)
	{
		super();

		this.args   = args;
		this.prev   = prev;
		this.status = -1;

		this.thread = new Promise((accept, reject) => {
			this[Accept] = accept;
			this[Reject] = reject;
		});

		this.id = taskId++;

		this.thread.finally(() => console.log(this.title + ' closed.'));

		return this;
	}

	then(callback)
	{
		return this.thread.then(callback);
	}

	catch(callback)
	{
		return this.thread.catch(callback);
	}

	finally(callback)
	{
		return this.thread.finally(callback);
	}

	print(detail)
	{
		this.dispatchEvent(new CustomEvent('output', {detail}));
	}

	printErr(detail)
	{
		this.dispatchEvent(new CustomEvent('error', {detail}));
	}

	signal(signalName)
	{
		console.log(this, `signal::${signalName}`);

		if(this[`signal::${signalName}`])
		{
			this[`signal::${signalName}`]();
		}

		switch(signalName)
		{
			case 'close':
				if(this.dispatchEvent(new CustomEvent('close')))
				{
					this.status > 0
						? this[Reject]()
						: this[Accept]();
				}
				break;

			case 'kill':
				this.status > 0
					? this[Reject]()
					: this[Accept]();
				break;
		}
	}

	execute()
	{
		return this[Execute](this.prev);
	}

	[Execute]()
	{
		let init = this.init(...this.args);

		const prev = this.prev;

		console.log(this.title + ' initialized.');

		if(!(init instanceof Promise))
		{
			init = Promise.resolve(init);
		}

		return init.then(() => {

			if(prev)
			{
				prev[Execute]();

				const onOutputEvent = ({detail}) => this.main(detail);

				prev.addEventListener('output', onOutputEvent);

				prev.then(r=> this[Accept](r));
				prev.catch(e=>this[Reject](r));
				
				return prev.finally(() => {
					prev.removeEventListener('output', onOutputEvent);
					return this.done();
				});
			}
			else
			{
				let main = this.main(undefined);

				if(!(main instanceof Promise))
				{
					main = Promise.resolve(main);
				}
				else
				{
					console.log(this.title + ' continues...');
				}

				main.then(r=>this[Accept](r));
				main.catch(e=>this[Reject](r));

				return main.then(() => {
					let done = this.done();

					if(!(done instanceof Promise))
					{
						done = Promise.resolve(done);
					}

					return done;
				});
			}
		});
	}

	init()
	{
	}

	main(input = null)
	{
	}

	done(results)
	{
		console.log(this.status);

		return this.status;
	}
}

// export class Task extends Target.mix(BaseTask){};

