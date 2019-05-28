import { View as BaseView } from 'curvature/base/View';

export class MeltingText extends BaseView
{
	constructor(args)
	{		
		super(args);

		this.charUp   = [
			'\u030d', /*     ̍     */		'\u030e', /*     ̎     */		'\u0304', /*     ̄     */		'\u0305', /*     ̅     */
			'\u033f', /*     ̿     */		'\u0311', /*     ̑     */		'\u0306', /*     ̆     */		'\u0310', /*     ̐     */
			'\u0352', /*     ͒     */		'\u0357', /*     ͗     */		'\u0351', /*     ͑     */		'\u0307', /*     ̇     */
			'\u0308', /*     ̈     */		'\u030a', /*     ̊     */		'\u0342', /*     ͂     */		'\u0343', /*     ̓     */
			'\u0344', /*     ̈́     */		'\u034a', /*     ͊     */		'\u034b', /*     ͋     */		'\u034c', /*     ͌     */
			// '\u0303', /*     ̃     */		'\u0302', /*     ̂     */		'\u030c', /*     ̌     */		'\u0350', /*     ͐     */
			'\u0300', /*     ̀     */		'\u0301', /*     ́     */		'\u030b', /*     ̋     */		'\u030f', /*     ̏     */
			'\u0312', /*     ̒     */		'\u0313', /*     ̓     */		'\u0314', /*     ̔     */		'\u033d', /*     ̽     */
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
			'\u0316', /*     ̖     */		'\u0317', /*     ̗     */		'\u0318', /*     ̘     */		'\u0319', /*     ̙     */
			'\u0316', /*     ̖     */		'\u0317', /*     ̗     */		'\u0318', /*     ̘     */		'\u0319', /*     ̙     */
			'\u0320', /*     ̠     */		'\u0324', /*     ̤     */		'\u0325', /*     ̥     */		'\u0326', /*     ̦     */
			'\u0329', /*     ̩     */		'\u032a', /*     ̪     */		'\u032b', /*     ̫     */		'\u032c', /*     ̬     */
			'\u032d', /*     ̭     */		'\u032e', /*     ̮     */		'\u032f', /*     ̯     */		'\u0330', /*     ̰     */
			// '\u0331', /*     ̱     */		'\u0332', /*     ̲     */		'\u0333', /*     ̳     */		'\u0339', /*     ̹     */
			// '\u033a', /*     ̺     */		'\u033b', /*     ̻     */		'\u033c', /*     ̼     */		'\u0345', /*     ͅ     */
			// '\u0347', /*     ͇     */		'\u0348', /*     ͈     */		'\u0349', /*     ͉     */		'\u034d', /*     ͍     */
			// '\u034e', /*     ͎     */		'\u0353', /*     ͓     */		'\u0354', /*     ͔     */		'\u0355', /*     ͕     */
			// '\u0356', /*     ͖     */		'\u0359', /*     ͙     */		'\u035a', /*     ͚     */		'\u0323' /*     ̣     */
		];

		this.template = `
			<div cv-bind = "output" class = "melting"></div>
		`;
		this.args.input      = `Magic is no more than the art of employing consciously invisible means to produce visible effects. Will, love, and imagination are magic powers that everyone possesses; and whoever knows how to develop them to their fullest extent is a magician. Magic has but one dogma, namely, that the seen is the measure of the unseen
`; 
		// this.args.input      = 'anything'; 
		this.args.output     = 'uh.'
		this.corruptors = {};
		this.maxCorrupt = 20;
		this.type       = '';

		this.args.bindTo('type', (v) => {
			this.output = this.corrupt(this.type);
		});

		setInterval(
			() => {
				this.typewriter(this.args.input);
			}
			, 25
		);
		setInterval(
			() => {
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
			}
			, 35
		);

		this.args.bindTo(
			'input'
			, (v) => { this.type = ''; this.corruptors = [] }
		);
	}
	corrupt(v) {
		let chars = v.split('');
		let rand  = (x) => parseInt(Math.random()*x);
		for(var i in chars) {
			if(!this.corruptors[i]) {
				this.corruptors[i] = [];
			}
			if(chars[i].match(/\W/)) {
				continue;
			}
			let charSets = [
				// this.charDown, this.charDown, this.charUp, 
				this.charDown,
				this.charDown,
				this.charUp,
				this.charMid,
			];
			let charSet  = charSets[ rand(charSets.length) ];
			while(this.corruptors[i].length < this.maxCorrupt) {
				if(rand(5) < 1) {
					this.corruptors[i].unshift(this.corruptors[i].pop());
					break;
				}
				if(charSet === this.charMid) {
					if(rand(15) > 9) {
						this.corruptors[i].shift();
						// continue;
					}
				}
				this.corruptors[i].unshift(charSet[ rand(charSet.length) ]);
			}
			if(this.corruptors[i].length >= this.maxCorrupt) {
				this.corruptors[i].pop();
			}
			
			chars[i] += this.corruptors[i].join('');
		}
		return chars.join('');
	}
	typewriter(v) {
		this.type = this.type || '';

		if(this.type !== v) {
			this.type += v.substr(this.type.length, 1);

			this.onTimeout(150, () => {
				if(document.body.scrollHeight > window.scrollY + window.innerHeight)
				{
					window.scrollTo({
						top: document.body.scrollHeight
						, left: 0
						, behavior: 'smooth'
					});
				}
			});

		}
		else {
			return true;
		}
		return false;
	}
}