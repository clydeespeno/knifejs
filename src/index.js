#!/usr/bin/env node

import program from 'commander';
import executor from './program/exec';
import pkg from '../package.json';

import search from './program/search';

program
  .version(pkg.version, '-V, --version')
  .option(
    '-c, --config <config>',
    'set config path. defaults to $HOME/.knifejs/config.json',
    `${process.env.HOME}/.knifejs/config.json`
  );

((exec) => [
  search
].forEach(c => c(program, exec)))(executor(program));


program.parse(process.argv);
