import { Config } from 'Config';
import { Socket } from 'subspace-client/Socket';
import { Task } from '../Task';

export class PublishFile extends Task
{
	title  = 'Publish File Task';

	static helpText = 'Publish bytes from a file to a channel.';
	static useText  = '/pubfile CHAN';

	init(fileChannel)
	{
		this.fileChannel = fileChannel;

		const fileInput = document.createElement('input');

		fileInput.setAttribute('type','file');

		fileInput.addEventListener('input', () => this.fileLoaded(event));

		fileInput.click();

		// this.term.socket.send(new Uint8Array(bytes));		
	}

	main()
	{
	}

	fileLoaded(event)
	{
		if(this.fileChannel === false)
		{
			return;
		}

		let fileReader = new FileReader();
		let field = event.target;
		let file = event.target.files[0];

		fileReader.addEventListener('load', (event) => {
			
			this.print(`Sending ${file.name}...`);

			if(this.fileChannel == parseInt(this.fileChannel))
			{
				this.term.socket.publish(
					this.fileChannel, event.target.result
				);
			}
			else
			{
				this.term.socket.publish(
					this.fileChannel, (new TextDecoder("utf-8")).decode(
						event.target.result
					)
				);
			}

			this.fileChannel = false;

			field.value = '';
		});

		fileReader.readAsArrayBuffer(file)
	}
}
