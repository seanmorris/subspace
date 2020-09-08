import { Tag     }  from 'curvature/base/Tag';
import { RuleSet }  from 'curvature/base/RuleSet';
import { Router  }  from 'curvature/base/Router';

import { Console }  from 'subspace-console/Console';

import { Path    }  from './Path';

import { rawquire } from 'rawquire/rawquire.macro';

console.log(Path);

const view = new Console({path: Path, init: '/init_rc'});

console.log(view);

RuleSet.add('body', view);
RuleSet.wait();
Router.wait(view);
