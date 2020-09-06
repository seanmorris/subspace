import { Task }       from './Task';
import { Lower }      from './tasks/Lower';
import { Upper }      from './tasks/Upper';
import { Prefix }     from './tasks/Prefix';
import { Suffix }     from './tasks/Suffix';
import { Countdown }  from './tasks/Countdown';

export const Path = {
	countdown: Countdown
	, upper:   Upper
	, lower:   Lower
	, prefix:  Prefix
	, suffix:  Suffix
};