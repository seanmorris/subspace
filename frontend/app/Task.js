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

	constructor(args = [], prev = null, term = null)
	{
		super();

		this.args   = args;
		this.prev   = prev;
		this.term   = term;
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

	write(line)
	{
		this.main(line);
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
		if(prev)
		{
			const onOutputEvent = ({detail}) => this.write(detail);

			prev.addEventListener('output', onOutputEvent);
		}

		console.log(this.title + ' initializing.')
		
		let init = this.init(...this.args);

		const prev = this.prev;

		if(!(init instanceof Promise))
		{
			init = Promise.resolve(init);
		}
		else
		{
			console.log(this.title + ' continues...');
		}

		if(prev)
		{
			prev[Execute]();

			return Promise.allSettled([prev, init]).finally(() => {
				prev.then(r=> this[Accept](r));
				prev.catch(e=>this[Reject](r));
				prev.removeEventListener('output', onOutputEvent);
				return this.done();
			});
		}
		else
		{
			return Promise.allSettled([init]).then(() =>{
				try{
					this.main(undefined);
					this[Accept]();
				}
				catch{
					this[Reject]();
				}

				this.done()
			});
		}
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

