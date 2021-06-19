import { View } from 'curvature/base/View';

export class TextMessageView extends View
{
	constructor(args = {})
	{
		super(args);

		this.template = `<span>&lt;&lt;&nbsp;</span><span class = "text">[[message]]</span>`;
	}
}
