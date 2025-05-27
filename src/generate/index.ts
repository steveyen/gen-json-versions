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

// Registry of phase generators
const phaseGenerators = {
  1: Phase1Generator,
  2: Phase2Generator,
  3: Phase3Generator,
  4: Phase4Generator,
  5: Phase5Generator,
} as const;

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

  public generateAll() {
    console.log('Generating test data for all phases...');
    for (let i = 1; i <= 5; i++) {
      this.generate(i);
    }
    console.log('Test data generation complete!');
  }

  public generate(phase: number) {
    const GeneratorClass = phaseGenerators[phase as keyof typeof phaseGenerators];
    if (!GeneratorClass) {
      throw new Error(`Unknown phase: ${phase}`);
    }

    const generator = new GeneratorClass(
      this.options.startDate,
      this.options.numRecords,
      this.options.numEmployees
    );
    const data = generator.generate();
    this.writeToFile(data, phase);
    return data;
  }
}