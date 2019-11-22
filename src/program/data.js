import {oMap} from '../knife/utils';

const cmdsFormat = {
  list: () =>
};

export default (program, exec) => program
  .command('data bag <cmd>')
  .description('searches the indexes on the chef server')
  .action((cmd) => {
    const cmds = Object.keys(cmdsFormat);
    if (cmds.find(c => c === cmd)) {
      return exec(k => k.search[cmd]()
          .then(r => r.format(cmdsFormat[index] || rows))
          .then(a => formatArray(a))
      );
    }
    return console.log(`Unknown index ${index}. Supported indexes are [${cmds}]`);
  });

