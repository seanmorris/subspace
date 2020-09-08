import { View as BaseView } from 'curvature/base/View';

export class MeltingText extends BaseView
{
	constructor(args)
	{
		super(args);

		this.last = this.init = Date.now();

		this.charUp   = [
			// '\u030d', /*     ̍     */		'\u030e', /*     ̎     */		'\u0304', /*     ̄     */		'\u0305', /*     ̅     */
			// '\u033f', /*     ̿     */		'\u0311', /*     ̑     */		'\u0306', /*     ̆     */		'\u0310', /*     ̐     */
			// '\u0352', /*     ͒     */		'\u0357', /*     ͗     */		'\u0351', /*     ͑     */		'\u0307', /*     ̇     */
			// '\u0308', /*     ̈     */		'\u030a', /*     ̊     */		'\u0342', /*     ͂     */		'\u0343', /*     ̓     */
			'\u0344', /*     ̈́     */		/*	'\u034a', /*     ͊     */	/*	'\u034b', /*     ͋     */	/*	'\u034c', /*     ͌     */
			'\u0303', /*     ̃     */		/*	'\u0302', /*     ̂     */	/*	'\u030c', /*     ̌     */	/*	'\u0350', /*     ͐     */
			'\u0300', /*     ̀     */		//	'\u0301', /*     ́     */		'\u030b', /*     ̋     */		'\u030f', /*     ̏     */
			// '\u0312', /*     ̒     */		'\u0313', /*     ̓     */		'\u0314', /*     ̔     */		'\u033d', /*     ̽     */
			// '\u0309', /*     ̉     */		'\u0363', /*     ͣ     */		'\u0364', /*     ͤ     */		'\u0365', /*     ͥ     */
			// '\u0366', /*     ͦ     */		'\u0367', /*     ͧ     */		'\u0368', /*     ͨ     */		'\u0369', /*     ͩ     */
			// '\u036a', /*     ͪ     */		'\u036b', /*     ͫ     */		'\u036c', /*     ͬ     */		'\u036d', /*     ͭ     */
			// '\u036e', /*     ͮ     */		'\u036f', /*     ͯ     */		'\u033e', /*     ̾     */		'\u035b', /*     ͛     */

		];

		this.charMid  = [
			'\u0315', /*     ̕     */		'\u031b', /*     ̛     */		'\u0340', /*     ̀     */		'\u0341', /*     ́     */
			'\u0358', /*     ͘     */		'\u0321', /*     ̡     */		'\u0322', /*     ̢     */		'\u0327', /*     ̧     */
			'\u0328', /*     ̨     */		'\u0334', /*     ̴     */		'\u0335', /*     ̵     */		'\u0336', /*     ̶     */
			'\u034f', /*     ͏     */		'\u035c', /*     ͜     */		'\u035d', /*     ͝     */		'\u035e', /*     ͞     */
			'\u035f', /*     ͟     */		'\u0360', /*     ͠     */		/*'\u0362',      ͢     */		'\u0338', /*     ̸     */
			'\u0337', /*     ̷     */		'\u0361', /*     ͡     */		/*'\u0489'     ҉_     */
		];

		this.charDown = [
			// '\u0316', /*     ̖     */		'\u0317', /*     ̗     */		'\u0318', /*     ̘     */		'\u0319', /*     ̙     */
			// '\u0316', /*     ̖     */		'\u0317', /*     ̗     */		'\u0318', /*     ̘     */		'\u0319', /*     ̙     */
			// '\u0320', /*     ̠     */		'\u0324', /*     ̤     */		'\u0325', /*     ̥     */		'\u0326', /*     ̦     */
			// '\u0329', /*     ̩     */		'\u032a', /*     ̪     */		'\u032b', /*     ̫     */		'\u032c', /*     ̬     */
			// '\u032d', /*     ̭     */		'\u032e', /*     ̮     */		'\u032f', /*     ̯     */		'\u0330', /*     ̰     */
			// '\u0331', /*     ̱     */		'\u0332', /*     ̲     */		'\u0333', /*     ̳     */		'\u0339', /*     ̹     */
			'\u033a', /*     ̺     */		'\u033b', /*     ̻     */		'\u033c', /*     ̼     */		'\u0345', /*     ͅ     */
			//'\u0347', /*     ͇     */		'\u0348', /*     ͈     */		'\u0349', /*     ͉     */		'\u034d', /*     ͍     */
			//'\u034e', /*     ͎     */		'\u0353', /*     ͓     */		'\u0354', /*     ͔     */		'\u0355', /*     ͕     */
			// '\u0356', /*     ͖     */		'\u0359', /*     ͙     */		'\u035a', /*     ͚     */		'\u0323' /*     ̣     */
		];

		this.template = `
			<div cv-bind = "output" class = "melting"></div>
		`;
		this.args.input      = `Magic is no more than the art of employing consciously invisible means to produce visible effects. Will, love, and imagination are magic powers that everyone possesses; and whoever knows how to develop them to their fullest extent is a magician. Magic has but one dogma, namely, that the seen is the measure of the unseen
`;
		// this.args.input      = 'anything';
		this.args.output     = 'uh.'
		this.corruptors = [];
		this.maxMaxCorrupt = 25;
		this.maxCorrupt = 0;
		this.type       = '';

		this.onFrame(() => {
			this.typewriter(this.args.input);
		});

		this.onInterval(16*4, () => {

			let selection = window.getSelection();

			if(selection.anchorOffset !== selection.focusOffset)
			{
				return;
			}

			if(selection.anchorNode !== selection.focusNode)
			{
				return;
			}

			this.args.output = this.corrupt(this.type);
			// this.args.output = this.type;
		});

		this.args.bindTo(
			'input'
			, (v) => { this.type = ''; this.corruptors = [] }
		);
	}

	age()
	{
		return this.init - Date.now();
	}

	lastFrame()
	{
		return this.last - Date.now();
	}

	corrupt(v)
	{
		if(v.length * 1.15 < this.args.input.length)
		{
			return this.type;
		}

		let chars  = v.split('');
		let random = (x) => parseInt(Math.random()*x);

		if(random(1024) < 256 && this.maxCorrupt < this.maxMaxCorrupt)
		{
			this.maxCorrupt += 5;
		}

		for(let i in chars) {
			this.corruptors[i] = this.corruptors[i] || [];

			if(chars[i].match(/\W/)) {
				continue;
			}

			let charSets = [
				// this.charDown // Melt Slow
				this.charDown, this.charMid // Melt
				// this.charDown, this.charUp,   this.charMid, // Boil
				// this.charMid, this.charUp, // Burn
				// this.charMid // Simmer
				// this.charUp // Rain
			];

			let charSet = charSets[ random(charSets.length) ];

			if(random(8192) < 1)
			{
				this.corruptors[i].unshift(charSet[ random(charSet.length) ]);
			}

			if(this.corruptors[i].length < this.maxCorrupt)
			{
				this.corruptors[i].unshift(charSet[ random(charSet.length) ]);
			}

			if(random(2048) < 1 && this.maxCorrupt > 25)
			{
				this.corruptors[i].splice(5 * random(5));
			}

			this.corruptors[i].push(this.corruptors[i].shift());
		}

		for(var i in chars)
		{
			if(this.corruptors[i])
			{
				chars[i] += this.corruptors[i].join('');
			}
		}

		return chars.join('');
	}

	typewriter(v)
	{
		this.type = this.type || '';

		if(this.type !== v)
		{
			this.type += v.substr(this.type.length, 1);

			this.onTimeout(150, () => {
				const max = window.scrollY + window.innerHeight;
				if(document.body.scrollHeight > max)
				{
					window.scrollTo({
						top: document.body.scrollHeight
						, left: 0
						, behavior: 'smooth'
					});
				}
			});

		}
		else
		{
			return true;
		}

		return false;
	}
}
