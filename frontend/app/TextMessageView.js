import { View } from 'curvature/base/View';

export class TextMessageView extends View
{
	constructor(args = {})
	{
		super(args);

		this.template = `<span>&gt;&gt;&nbsp;</span><span class = "text">[[message]]</span>`;
	}
}
