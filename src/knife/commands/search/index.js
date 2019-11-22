import {oMap} from '../../utils';

import node from './node';
import users from './users';
import client from './client';
import role from './role';

export default (chef) => oMap({
  node,
  users,
  client,
  role
}, (e) => e(chef));
