#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

interface CLIOptions {
  employeeFile: string;
  phasesFile: string;
  outputDir: string;
}

class CLI {
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name('json-data-generator')
      .description('Generate JSON data from employee and phase files')
      .version('1.0.0');

    this.program
      .command('generate')
      .description('Generate JSON data files')
      .requiredOption('-e, --employee-file <path>', 'Path to employee JSON file')
      .requiredOption('-p, --phases-file <path>', 'Path to markdown phases file')
      .requiredOption('-o, --output-dir <path>', 'Output directory for generated files')
      .action(this.handleGenerate.bind(this));
  }

  private async handleGenerate(options: CLIOptions): Promise<void> {
    try {
      console.log('JSON Data Generator CLI');
      console.log('======================');

      // Validate arguments
      this.validateArguments(options);

      console.log(`Employee file: ${options.employeeFile}`);
      console.log(`Phases file: ${options.phasesFile}`);
      console.log(`Output directory: ${options.outputDir}`);

      // TODO: Implement the actual generation logic
      console.log('Generation logic will be implemented in subsequent tasks.');

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  private validateArguments(options: CLIOptions): void {
    // Check if employee file exists and is readable
    if (!fs.existsSync(options.employeeFile)) {
      throw new Error(`Employee file not found: ${options.employeeFile}`);
    }

    if (!fs.statSync(options.employeeFile).isFile()) {
      throw new Error(`Employee file is not a regular file: ${options.employeeFile}`);
    }

    // Check if phases file exists and is readable
    if (!fs.existsSync(options.phasesFile)) {
      throw new Error(`Phases file not found: ${options.phasesFile}`);
    }

    if (!fs.statSync(options.phasesFile).isFile()) {
      throw new Error(`Phases file is not a regular file: ${options.phasesFile}`);
    }

    // Check if output directory exists, create if it doesn't
    if (!fs.existsSync(options.outputDir)) {
      console.log(`Creating output directory: ${options.outputDir}`);
      fs.mkdirSync(options.outputDir, { recursive: true });
    } else if (!fs.statSync(options.outputDir).isDirectory()) {
      throw new Error(`Output path is not a directory: ${options.outputDir}`);
    }
  }

  public run(): void {
    this.program.parse();
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  const cli = new CLI();
  cli.run();
}

export { CLI, CLIOptions };