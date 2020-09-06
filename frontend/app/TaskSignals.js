export class TaskSignals
{
	static KILL  = 'kill'
	static CLOSE = 'close'
	
	'signal::kill'()
	{
		console.log('KILL!');

		this.status > 0
			? this[Reject]()
			: this[Accept]();
	}

	'signal::close'()
	{
		if(this.dispatchEvent(new CustomEvent('error', {detail})))
		{
			this.status > 0
				? this[Reject]()
				: this[Accept]();
		}
	}
}