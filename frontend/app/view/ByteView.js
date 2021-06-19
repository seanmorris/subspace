import { View } from 'curvature/base/View';

export class ByteView extends View
{
	constructor(args = {})
	{
		super(args);

		this.args.separator = this.args.separator || '';

		this.template = `<span cv-each = "bytes:byte:b" class = "bytes"><span
				class  = "byte"
				cv-on  = "cvDomAttached:color(event, byte, $view)"
				cv-ref = "byte:curvature/base/Tag"

			>[[byte]][[separator]]</span></span>`;
	}

	color(event, byte, $view)
	{
		let hue = parseInt(byte, 16);

		// let color = '#' + [
		// 	(Math.pow(Math.cos(Math.PI * hue + 5), 2) * 192)
		// 	, (Math.pow(Math.cos(Math.PI * hue + 10), 2) * 192)
		// 	, (Math.pow(Math.cos(Math.PI * hue + 0), 2) * 192)
		// ].map((x)=>Math.floor(x).toString(16).padStart(2, '0')).join('');

		if(!hue)
		{
			return;
		}

		let color = "hsl(" + ((360 * hue) / 0xFF) + ",100%,50%)";

		$view.tags.byte.element.style.color = color;

		// $view.tags.byte.element.style['text-shadow'] = `2px 0px 5px ${color}, -2px 0px 5px ${color}`
	}
}
