import {formatProxy} from '../../utils';

export default (client) => (params) =>
  client.get('/search/client', {params}).then(formatProxy);

