import { View as BaseView } from 'curvature/base/View';

export class View extends BaseView
{
	constructor(args = {})
	{
		super(args);

		this.template = require('./view.tmp');
	}
}