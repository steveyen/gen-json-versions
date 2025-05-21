#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';
import { Phase1Generator } from './generators/phase1';
import { Phase2Generator } from './generators/phase2';
import { Phase3Generator } from './generators/phase3';
import { Phase4Generator } from './generators/phase4';
import { Phase5Generator } from './generators/phase5';
import { writeFileSync } from 'fs';
import { join } from 'path';

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

// Example usage:
if (require.main === module) {
  const generator = new TestDataGenerator({
    startDate: new Date('2024-01-01'),
    numRecords: 30,
    numEmployees: 15,
    outputDir: 'test-data'
  });

  generator.generateAll();
}
