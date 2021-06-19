import { Task } from 'subspace-console/Task';

export class AudioTask extends Task
{
	title  = 'AudioTask';
	prompt = '..';

	static helpText = 'Run an audio operation in a separate thread.';
	static useText  = 'audiotask';

	init(...args)
	{
		const whiteNoise = (inputs, outputs, parameters) =>	{
			outputs[0].forEach(channel => {
				for (let i = 0; i < channel.length; i++)
				{
					channel[i] = 440; ( Math.random() * 2 - 1 ) * 0.25;
				}
			});
			return true;
		};

		const source = `
			const WhiteNoiseProcessor = class extends AudioWorkletProcessor
			{
				_process = ${ whiteNoise }
				process(inputs, outputs, parameters)
				{ return this._process(inputs, outputs, parameters); }
			}
			registerProcessor('white-noise-processor', WhiteNoiseProcessor);
		`;

		const sourceUri = URL.createObjectURL(new Blob([source], {
			type : 'application/javascript'
		}));

		const context = new AudioContext();

		const ready = context.audioWorklet.addModule(sourceUri);

		ready.then( () => {

			const node = new AudioWorkletNode(context, 'white-noise-processor');

			node.addEventListener('processorerror', error => { throw error });

			node.connect(context.destination);

			setTimeout(() => node.disconnect(), 500);

		}).catch(error => console.log(error));

		this.status = 0;

		return new Promise( accept => setTimeout(()=>{

			console.log('1234');

			accept();

		}, 500) );

	}
}
