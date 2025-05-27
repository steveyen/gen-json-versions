#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';
import { TestDataGenerator } from './generate';

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

// Examples:
//   a-team generate --start-date 2024-01-01 --records 30 --employees 15 --output-dir data --phase all
//   a-team generate -s 2024-01-01 -r 30 -e 15 -o data -p all
program
  .command('generate')
  .description('Generate test data for the bakery scheduling system')
  .option('-s, --start-date <date>', 'Start date for the test data (YYYY-MM-DD)', '2024-01-01')
  .option('-r, --records <number>', 'Number of records to generate', '30')
  .option('-e, --employees <number>', 'Number of employees to generate', '15')
  .option('-o, --output-dir <path>', 'Output directory for the generated data', 'data')
  .option('-p, --phase <number>', 'Specific phase to generate (1-5), or "all" for all phases', 'all')
  .action((options) => {
    const generator = new TestDataGenerator({
      startDate: new Date(options.startDate),
      numRecords: parseInt(options.records),
      numEmployees: parseInt(options.employees),
      outputDir: options.outputDir
    });

    if (options.phase === 'all') {
      generator.generateAll();
    } else {
      const phase = parseInt(options.phase);
      generator.generate(phase);
    }
  });

program.parse();
