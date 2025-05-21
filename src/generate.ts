import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Phase1Generator } from './generators/phase1';
import { Phase2Generator } from './generators/phase2';
import { Phase3Generator } from './generators/phase3';
import { Phase4Generator } from './generators/phase4';
import { Phase5Generator } from './generators/phase5';

interface GeneratorOptions {
  startDate?: Date;
  numRecords?: number;
  numEmployees?: number;
  outputDir?: string;
}

export class TestDataGenerator {
  private options: Required<GeneratorOptions>;

  constructor(options: GeneratorOptions = {}) {
    this.options = {
      startDate: options.startDate || new Date(),
      numRecords: options.numRecords || 10,
      numEmployees: options.numEmployees || 12,
      outputDir: options.outputDir || 'test-data'
    };
  }

  private writeToFile(data: any, phase: number) {
    const filename = `phase${phase}.json`;
    const filepath = join(this.options.outputDir, filename);
    writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`Generated test data for Phase ${phase} at ${filepath}`);
  }

  public generatePhase1() {
    const generator = new Phase1Generator(this.options.startDate, this.options.numRecords);
    const data = generator.generate();
    this.writeToFile(data, 1);
    return data;
  }

  public generatePhase2() {
    const generator = new Phase2Generator(this.options.startDate, this.options.numRecords, this.options.numEmployees);
    const data = generator.generate();
    this.writeToFile(data, 2);
    return data;
  }

  public generatePhase3() {
    const generator = new Phase3Generator(this.options.startDate, this.options.numRecords, this.options.numEmployees);
    const data = generator.generate();
    this.writeToFile(data, 3);
    return data;
  }

  public generatePhase4() {
    const generator = new Phase4Generator(this.options.startDate, this.options.numRecords, this.options.numEmployees);
    const data = generator.generate();
    this.writeToFile(data, 4);
    return data;
  }

  public generatePhase5() {
    const generator = new Phase5Generator(this.options.startDate, this.options.numRecords, this.options.numEmployees);
    const data = generator.generate();
    this.writeToFile(data, 5);
    return data;
  }

  public generateAll() {
    console.log('Generating test data for all phases...');
    this.generatePhase1();
    this.generatePhase2();
    this.generatePhase3();
    this.generatePhase4();
    this.generatePhase5();
    console.log('Test data generation complete!');
  }
}

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