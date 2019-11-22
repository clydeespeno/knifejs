import search from './commands/search';

export default (client) => {
  return {
    search: search(client)
  };
};

