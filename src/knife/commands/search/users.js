import {formatProxy} from '../../utils';

export default (client) => (params) =>
  client.get('/search/users', {params}).then(formatProxy);

