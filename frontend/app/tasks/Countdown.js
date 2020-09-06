import { Task } from '../Task';

export class Countdown extends Task
{
	title  = 'Countdown Task';

	static helpText = 'Countdown from a given number.';
	static useText  = '/countdown MAX [INTERVAL]';

	init(max, interval = 1000)
	{
		this.max      = Number(max);
		this.interval = Number(interval);
	}

	main()
	{
		let count = this.max;

		if(!this.max)
		{
			this.status = 1;
			this.printErr('Max must be a number > 0.');
			return;
		}

		if(!this.interval)
		{
			this.status = 1;
			this.printErr('Interval must be a number > 0.');
			return;
		}

		this.status = 0;


		return new Promise((accept, reject) => {
			
			this.finally(()=>clearInterval(interval));
	
			const interval = setInterval(()=> {

				console.log(this);
	
				this.print(`${--count} iterations left${count?'...':'.'}`)

				if(count <= 0)
				{
					accept();
				}

			}, this.interval);

		});
	}
}