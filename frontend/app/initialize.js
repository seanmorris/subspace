import { Tag      } from 'curvature/base/Tag';
import { RuleSet  } from 'curvature/base/RuleSet';
import { Router   } from 'curvature/base/Router';
import { RootView } from './RootView';

let view = new RootView;

RuleSet.add('body', view);

RuleSet.wait();

Router.wait(view);
