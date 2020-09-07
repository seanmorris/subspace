import { Task } from '../Task';

export class PublishAjax extends Task
{
	title  = 'Publish Ajax Task';

	static helpText = 'Publish to a channel via AJAX.';
	static useText  = '/pubajax';

	init(...args)
	{
		if (!this.term.postToken)
		{
			this.print(`Please aquire a POST token first.`);
			return;
		}
		
		this.print(`${this.postToken}`);

		const _formData = new FormData();

		_formData.append('token',   this.term.postToken);
		_formData.append('channel', args.shift());
		_formData.append('message', args.join(' '));

		console.log(_formData);

		const options = {method: 'post', body: _formData};

		return fetch('/post', options).then((response)=>{
			console.log(response);
		});
	}
}
