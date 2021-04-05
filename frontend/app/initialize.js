import { Tag      }  from 'curvature/base/Tag';
import { RuleSet  }  from 'curvature/base/RuleSet';
import { Router   }  from 'curvature/base/Router';

import { Console  }  from 'subspace-console/Console';
import { Path     }  from './Path';
import { rawquire } from 'rawquire/rawquire.macro';
import { Socket   }   from 'subspace-client/Socket';

const view = new Console({
	path: Path, init: '/init_rc'
});

const buildId   = document.querySelector('meta[type="x-build-id"]');
const buildTime = document.querySelector('meta[type="x-build-localtime"]');

view.rendered.then(() => {
	view.args.output.push(
		'* SubSpace Console / Kallisti Websockets Playground'
		, `* Version: ${ buildId &&   buildId.getAttribute('content')}`
		, `* Built ${ buildTime && buildTime.getAttribute('content')}`
		, '* ©2018-2021 Sean Morris'
	);
});

RuleSet.add('body', view);
RuleSet.wait();
Router.wait(view);
