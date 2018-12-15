import { View } from 'curvature/base/View';

export class ByteView extends View
{
	constructor(args = {})
	{
		super(args);

		this.args.separator = this.args.separator || '';

		this.template = `<span
			cv-each = "bytes:byte:b"
			cv-carry = "separator"
			style = "display: block"
			"><span
				cv-on = "cvDomAttached:color(event, byte, $view)"
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

		$view.tags.byte.element.style.color = "hsl(" + (
			(360 * hue) / 0xFF
		) + ",70%,70%)";;
	}
}
