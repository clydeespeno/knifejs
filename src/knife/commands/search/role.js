import {formatProxy} from '../../utils';

export default (client) => (params) =>
  client.get('/search/role', {params}).then(formatProxy);

