import { Task } from '../Task';

export class SayAjax extends Task
{
	title  = 'Say Ajax Task';

	static helpText = 'Whisper on a channel via AJAX.';
	static useText  = '/sayajax';

	init(...args)
	{
		if (!this.term.postToken)
		{
			this.print(`Please aquire a POST token first.`);
			return;
		}
		
		this.print(`${this.postToken}`);

		const formData = new FormData();

		const ccCount  = args.shift();
		const ccList   = args.splice(0, ccCount);
		const bccCount = args.shift();
		const bccList  = args.splice(0, bccCount);

		formData.append('cc',  ccList.join(','));
		formData.append('bcc', bccList.join(','));

		console.log(ccList, bccList);

		formData.append('token',   this.term.postToken);
		formData.append('channel', args.shift());
		formData.append('message', args.join(' '));

		const options = {method: 'post', body: formData};

		return fetch('/post', options).then((response)=>{
			console.log(response);
		});
	}
}
