#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import { name } from '../package.json';
import { PhasesParser } from './parser/phases-parser';

interface CLIOptions {
  employeesFile: string;
  phasesFile: string;
  outputDir: string;
  verbose?: boolean;
}

class CLI {
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name(name)
      .description('Generate JSON data from employee and phase files')
      .version('1.0.0');

    this.program
      .command('generate')
      .description('Generate JSON data files')
      .requiredOption('-e, --employees-file <path>', 'Path to employees JSON file')
      .requiredOption('-p, --phases-file <path>', 'Path to markdown phases file')
      .requiredOption('-o, --output-dir <path>', 'Output directory for generated files')
      .option('-v, --verbose', 'Enable verbose output with pretty-printed JSON blocks')
      .action(this.handleGenerate.bind(this));
  }

  private async handleGenerate(options: CLIOptions): Promise<void> {
    try {
      console.log('JSON Data Generator CLI');
      console.log('======================');

      // Validate arguments
      this.validateArguments(options);

      console.log(`Employee file: ${options.employeesFile}`);
      console.log(`Phases file: ${options.phasesFile}`);
      console.log(`Output dir: ${options.outputDir}`);

      // Load and validate phases for early sanity checking
      console.log('\n📋 Loading phases...');

      const phasesResult = PhasesParser.parseFile(options.phasesFile);
      if (phasesResult.error) {
        throw new Error(`Failed to parse phases file: ${phasesResult.error}`);
      }

      const phases = phasesResult.phases!;

      // Log loaded versions for sanity checking
      console.log(`✅ Successfully loaded ${phases.length} phase(s):`);

      phases.forEach((phase, index) => {
        console.log(` ${index + 1}. ${phase.name} (${phase.version}) - ${phase.jsonBlocks.length} JSON block(s)`);

        // Pretty-print JSON blocks if verbose mode is enabled
        if (options.verbose) {
          console.log(`\n    📄 JSON Blocks for phase "${phase.name}":`);

          phase.jsonBlocks.forEach((block, blockIndex) => {
            console.log(`\nJSON Block ${blockIndex + 1}:`);

            try {
              const parsedJson = JSON.parse(block.content);
              console.log(JSON.stringify(parsedJson, null, 2));
            } catch (parseError) {
              console.log(`   ⚠️ Invalid JSON in block ${blockIndex + 1}:`);
              console.log(`   ${block.content}`);
            }
          });
        }
      });

      // Validate phases
      const validationResult = PhasesParser.validatePhases(phases);
      if (validationResult.error) {
        throw new Error(`Phase validation failed: ${validationResult.error}`);
      }

      console.log('\n✅ Phase validation passed');
      console.log('\n🚀 Ready to proceed with data generation...');
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('\n❌ Error occurred:');
    console.error(`   ${errorMessage}`);

    // Provide helpful suggestions based on error type
    if (errorMessage.includes('not found')) {
      console.error('\n💡 Suggestions:');
      console.error('   - Check that the file path is correct');
      console.error('   - Ensure the file exists in the specified location');
      console.error('   - Use absolute paths if needed');
    } else if (errorMessage.includes('not readable')) {
      console.error('\n💡 Suggestions:');
      console.error('   - Check file permissions');
      console.error('   - Ensure you have read access to the file');
    } else if (errorMessage.includes('not writable')) {
      console.error('\n💡 Suggestions:');
      console.error('   - Check directory permissions');
      console.error('   - Ensure you have write access to the output directory');
    } else if (errorMessage.includes('extension')) {
      console.error('\n💡 Suggestions:');
      console.error('   - Employee file should have .json extension');
      console.error('   - Phases file should have .md or .markdown extension');
    }

    console.error(`\nFor help, run: ${this.program.name()} --help`);

    process.exit(1);
  }

  private validateArguments(options: CLIOptions): void {
    // Validate employee file
    this.validateFile('Employee', options.employeesFile, '.json');

    // Validate phases file
    this.validateFile('Phases', options.phasesFile, '.md');

    // Validate output directory
    this.ensureDir('Output', options.outputDir);
  }

  private validateFile(kind: string, filePath: string, suffix?: string): void {
    // Check if path is provided
    if (!filePath || filePath.trim() === '') {
      throw new Error(`${kind} file path is required and cannot be empty`);
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`${kind} file not found: ${filePath}`);
    }

    // Check if it's a regular file
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      throw new Error(`${kind} file is not a regular file: ${filePath}`);
    }

    // Check if file is readable
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`${kind} file is not readable: ${filePath}`);
    }

    // Check file extension
    if (suffix && !filePath.toLowerCase().endsWith(suffix)) {
      throw new Error(`${kind} file should have ${suffix} extension: ${filePath}`);
    }
  }

  private ensureDir(kind: string, dirPath: string): void {
    // Check if path is provided
    if (!dirPath || dirPath.trim() === '') {
      throw new Error(`${kind} directory path is required and cannot be empty`);
    }

    // Check if path already exists
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`${kind} path exists but is not a directory: ${dirPath}`);
      }
    } else {
      // Try to create the directory
      try {
        console.log(`${kind} directory creating: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
      } catch (error) {
        throw new Error(`${kind} directory creation failed: ${dirPath}. Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Check if directory is writable
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`${kind} directory is not writable: ${dirPath}`);
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