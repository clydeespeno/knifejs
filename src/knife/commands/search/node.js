import {formatProxy} from '../../utils';

export default (client) => (params) =>
  client.get('/search/node', {params}).then(formatProxy);

