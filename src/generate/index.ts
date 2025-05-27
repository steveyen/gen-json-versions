import { writeFileSync } from 'fs';
import { join } from 'path';
import { Phase1Generator } from './phase1';
import { Phase2Generator } from './phase2';
import { Phase3Generator } from './phase3';
import { Phase4Generator } from './phase4';
import { Phase5Generator } from './phase5';

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

  public generate(phase: number) {
    switch (phase) {
      case 1:
        return this.generatePhase1();
      case 2:
        return this.generatePhase2();
      case 3:
        return this.generatePhase3();
      case 4:
        return this.generatePhase4();
      case 5:
        return this.generatePhase5();
      default:
        throw new Error("unknown phase: " + phase);
    }
  }
}