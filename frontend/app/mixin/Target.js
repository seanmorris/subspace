import { Mixin } from 'curvature/base/Mixin';

const target = Symbol('target');

let index = 0;

export const Target = {
	[Mixin.constructor]()
	{
		try
		{
			this[target] = new EventTarget;
		}
		catch(error)
		{
			this[target] = document.createDocumentFragment();
		}

		this[target].x = index++;
	}

	, dispatchEvent(...args)
	{
		this[target].dispatchEvent(...args);
	}

	, addEventListener(...args)
	{
		this[target].addEventListener(...args);
	}

	, removeEventListener(...args)
	{
		this[target].removeEventListener(...args);
	}
}
