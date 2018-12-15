import { View } from 'curvature/base/View';

export class BinaryMessageView extends View
{
	constructor(args = {})
	{
		super(args);

		this.template = `<span>&gt;&gt;&nbsp;0x</span>[[header]]&nbsp;[[message]]`;
	}
}
