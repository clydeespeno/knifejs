import {formatValue, formatArray, oMap} from '../knife/utils';

const rows = r => JSON.stringify(r, null, 2);

const nodeFormat = n => `
Name:        ${n.name}
Environment: ${n.chef_environment}
IP:          ${n.automatic.ipaddress}
Platform:    ${n.automatic.platform} ${n.automatic.platform_version}
`;

const roleFormat = r => `
Name: ${r.name}
Description: ${r.description}
Attributes: 
  Default: ${formatValue(r.default_attributes, 4)}
  Override: ${formatValue(r.override_attributes, 4)}
`;

const clientFormat = c => `
Name: ${c.name}
Cient Name: ${c.clientname}
Validator: ${c.validator},
Public Key: 
${c.public_key}
`;

const rowMapper = (format = rows) => v => {
  if (v.rows && v.rows.length) {
    return v.rows.map(format)
  }
  return 'No results found';
};

const indexFormat = oMap({
  node: nodeFormat,
  role: roleFormat,
  client: clientFormat,
  users: rows
}, (e) => rowMapper(e));

export default (program, exec) => program
  .command('search <index> <query>')
  .description('searches the indexes on the chef server')
  .action((index, query) => {
    const indexes = Object.keys(indexFormat);
    if (indexes.find(c => c === index)) {
      return exec(k => k.search[index]({q: query})
          .then(r => r.format(indexFormat[index] || rows))
          .then(a => formatArray(a))
      );
    }
    return console.log(`Unknown index ${index}. Supported indexes are [${indexes}]`);
  });

