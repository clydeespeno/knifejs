import {oMap} from '../../utils';

import create from './create';
import del from './delete';
import edit from './edit';
import list from './edit';

export default (chef) => ({
  bag: oMap({
    create,
    edit,
    list,
    'delete': del
  }, e => e(chef))
});
