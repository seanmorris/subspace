import { Echo }       from './tasks/Echo';
import { Parse }      from './tasks/Parse';
import { Lower }      from './tasks/Lower';
import { Upper }      from './tasks/Upper';
import { Prefix }     from './tasks/Prefix';
import { Suffix }     from './tasks/Suffix';
import { Countdown }  from './tasks/Countdown';

import { Auth }       from './tasks/Auth';
import { Login }      from './tasks/Login';
import { Register }   from './tasks/Register';
import { RtcClient }  from './tasks/RtcClient';
import { RtcServer }  from './tasks/RtcServer';

import { PublishBytes } from './tasks/PublishBytes';
import { PublishFile  } from './tasks/PublishFile';
import { SayText      } from './tasks/SayText';
import { Raw          } from './tasks/Raw';
import { WatchImages  } from './tasks/WatchImages';
import { PublishAjax  } from './tasks/PublishAjax';
import { Connection   } from './tasks/Connection';

import { CoTask    } from './tasks/CoTask';
import { AudioTask } from './tasks/AudioTask';

import { Measure } from './tasks/Measure';

import { Theme } from './tasks/Theme';

const PathHandler = class {

	constructor()
	{

	}

};

export const Path = {
	countdown:   Countdown
	, echo:      Echo
	, parse:     Parse
	, upper:     Upper
	, lower:     Lower
	, prefix:    Prefix
	, suffix:    Suffix

	, auth:      Auth
	, pub:       PublishBytes
	, pubajax:   PublishAjax
	, pubfile:   PublishFile
	, say:       SayText
	, images:    WatchImages
	, raw:       Raw

	, login:     Login
	, register:  Register

	, rtcc:      RtcClient
	, rtcs:      RtcServer
	, connect:   Connection
	, theme:     Theme

	, measure:   Measure

	, cotask:    CoTask
	, audiotask: AudioTask
};
