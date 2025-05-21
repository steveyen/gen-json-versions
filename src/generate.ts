import { Command } from 'commander';
import { TestDataGenerator } from './index';

const program = new Command();

program
  .name('test-data-generator')
  .description('Generate test data for the bakery scheduling system')
  .version('1.0.0');

program
  .option('-s, --start-date <date>', 'Start date for the test data (YYYY-MM-DD)', '2024-01-01')
  .option('-r, --records <number>', 'Number of records to generate', '30')
  .option('-e, --employees <number>', 'Number of employees to generate', '15')
  .option('-o, --output-dir <path>', 'Output directory for the generated data', 'data')
  .option('-p, --phase <number>', 'Specific phase to generate (1-5), or "all" for all phases', 'all');

program.parse();

const options = program.opts();

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
  if (phase < 1 || phase > 5) {
    console.error('Invalid phase number. Please specify a number between 1 and 5, or "all".');
    process.exit(1);
  }

  switch (phase) {
    case 1:
      generator.generatePhase1();
      break;
    case 2:
      generator.generatePhase2();
      break;
    case 3:
      generator.generatePhase3();
      break;
    case 4:
      generator.generatePhase4();
      break;
    case 5:
      generator.generatePhase5();
      break;
  }
}