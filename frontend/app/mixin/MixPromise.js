import { Mixin }    from 'curvature/base/Mixin';
import { Bindable } from 'curvature/base/Bindable';

const promise = Symbol('promise');

export class MixPromise 
{
	[Mixin._constructor](instance)
	{
		instance[promise] = new Promise;
	}

	then(callback)
	{
		return this[promise].then(callback);
	}

	catch(callback)
	{
		return this[promise].catch(callback);
	}

	finally(callback)
	{
		return this[promise].finally(callback);
	}
}
