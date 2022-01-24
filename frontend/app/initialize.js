import { Tag      } from 'curvature/base/Tag';
import { RuleSet  } from 'curvature/base/RuleSet';
import { Router   } from 'curvature/base/Router';

import { Console  } from 'subspace-console/Console';
import { Path     } from './Path';
import { rawquire } from 'rawquire/rawquire.macro';
import { Socket   } from 'subspace-client/Socket';

const view = new Console({
	path: Path, init: '/init_rc'
});

const buildId   = document.querySelector('meta[type="x-build-id"]');
const buildTime = document.querySelector('meta[type="x-build-localtime"]');

view.rendered.then(() => {
	view.write(
		'\\e[2m\\e[43m\\e[30m* SubSpace Console - Kallisti Websockets Playground'
		, `\\e[2m\\e[40m\\e[37m* Version: ${ buildId && buildId.getAttribute('content')}`
		, `\\e[30m* Built @ ${ buildTime && buildTime.getAttribute('content').split(' GMT')[0]}`
		, `\\e[30m* GMT${ buildTime && buildTime.getAttribute('content').split(' GMT')[1]}`
		, '\\e[30m* © 2018-2022 \\e[0m\\e[2mSean Morris'
	);
});

RuleSet.add('body', view);
RuleSet.wait();
Router.wait(view);
