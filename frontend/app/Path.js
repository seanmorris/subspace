import { Task }       from './Task';
import { Lower }      from './tasks/Lower';
import { Upper }      from './tasks/Upper';
import { Prefix }     from './tasks/Prefix';
import { Suffix }     from './tasks/Suffix';
import { Countdown }  from './tasks/Countdown';
import { Login }      from './tasks/Login';
import { Register }   from './tasks/Register';
import { RtcClient }  from './tasks/RtcClient';
import { RtcServer }  from './tasks/RtcServer';

import { PublishBytes }  from './tasks/PublishBytes';
import { PublishFile }  from './tasks/PublishFile';
import { WatchImages }  from './tasks/WatchImages';

export const Path = {
	countdown:   Countdown
	, upper:     Upper
	, lower:     Lower
	, prefix:    Prefix
	, suffix:    Suffix
	, pub:       PublishBytes
	, pubfile:   PublishFile
	, images:    WatchImages
	, login:     Login
	, register:  Register
	, rtcc:      RtcClient
	, rtcs:      RtcServer
};
