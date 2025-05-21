#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';

const program = new Command();

program
  .name('a-team')
  .description('A-Team: AI / Agentic task management for teams')
  .version(version);

program
  .command('hello')
  .description('Say hello')
  .argument('<name>', 'Name to greet')
  .option('-c, --capitalize', 'Capitalize the name')
  .action((name: string, options: { capitalize?: boolean }) => {
    const greeting = `Hello, ${options.capitalize ? name.toUpperCase() : name}!`;
    console.log(greeting);
  });

program.parse();
