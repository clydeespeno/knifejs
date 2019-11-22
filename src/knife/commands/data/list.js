import {formatProxy} from '../../utils';

export default (chef) => (params) => chef.get('/data', {params}).then(formatProxy);
