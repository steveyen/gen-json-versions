#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import { MarkdownParser } from './parser/markdown-parser';

interface CLIOptions {
  employeeFile: string;
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
      .name('json-data-generator')
      .description('Generate JSON data from employee and phase files')
      .version('1.0.0');

    this.program
      .command('generate')
      .description('Generate JSON data files')
      .requiredOption('-e, --employee-file <path>', 'Path to employee JSON file')
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

      console.log(`Employee file: ${options.employeeFile}`);
      console.log(`Phases file: ${options.phasesFile}`);
      console.log(`Output directory: ${options.outputDir}`);

      // Load and validate phases for early sanity checking
      console.log('\n📋 Loading phases...');
      const phasesResult = MarkdownParser.parseMarkdownFile(options.phasesFile);

      if (!phasesResult.success) {
        throw new Error(`Failed to parse phases file: ${phasesResult.error}`);
      }

      const phases = phasesResult.phases!;

      // Log loaded versions for sanity checking
      console.log(`✅ Successfully loaded ${phases.length} phase(s):`);
      phases.forEach((phase, index) => {
        console.log(`   ${index + 1}. ${phase.name} (${phase.version}) - ${phase.jsonBlocks.length} JSON block(s)`);

        // Pretty-print JSON blocks if verbose mode is enabled
        if (options.verbose) {
          console.log(`\n📄 JSON Blocks for phase "${phase.name}":`);
          phase.jsonBlocks.forEach((block, blockIndex) => {
            console.log(`\n   Block ${blockIndex + 1}:`);
            try {
              const parsedJson = JSON.parse(block.content);
              console.log(JSON.stringify(parsedJson, null, 2));
            } catch (parseError) {
              console.log(`   ⚠️  Invalid JSON in block ${blockIndex + 1}:`);
              console.log(`   ${block.content}`);
            }
          });
        }
      });

      // Validate phases
      const validationResult = MarkdownParser.validatePhases(phases);
      if (!validationResult.success) {
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

    console.error('\nFor help, run: json-data-generator --help');
    process.exit(1);
  }

  private validateArguments(options: CLIOptions): void {
    // Validate employee file
    this.validateEmployeeFile(options.employeeFile);

    // Validate phases file
    this.validatePhasesFile(options.phasesFile);

    // Validate output directory
    this.validateOutputDirectory(options.outputDir);
  }

  private validateEmployeeFile(employeeFile: string): void {
    // Check if path is provided
    if (!employeeFile || employeeFile.trim() === '') {
      throw new Error('Employee file path is required and cannot be empty');
    }

    // Check if file exists
    if (!fs.existsSync(employeeFile)) {
      throw new Error(`Employee file not found: ${employeeFile}`);
    }

    // Check if it's a regular file
    const stats = fs.statSync(employeeFile);
    if (!stats.isFile()) {
      throw new Error(`Employee file is not a regular file: ${employeeFile}`);
    }

    // Check if file is readable
    try {
      fs.accessSync(employeeFile, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`Employee file is not readable: ${employeeFile}`);
    }

    // Check file extension
    if (!employeeFile.toLowerCase().endsWith('.json')) {
      throw new Error(`Employee file should have .json extension: ${employeeFile}`);
    }
  }

  private validatePhasesFile(phasesFile: string): void {
    // Check if path is provided
    if (!phasesFile || phasesFile.trim() === '') {
      throw new Error('Phases file path is required and cannot be empty');
    }

    // Check if file exists
    if (!fs.existsSync(phasesFile)) {
      throw new Error(`Phases file not found: ${phasesFile}`);
    }

    // Check if it's a regular file
    const stats = fs.statSync(phasesFile);
    if (!stats.isFile()) {
      throw new Error(`Phases file is not a regular file: ${phasesFile}`);
    }

    // Check if file is readable
    try {
      fs.accessSync(phasesFile, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`Phases file is not readable: ${phasesFile}`);
    }

    // Check file extension (allow .md or .markdown)
    const lowerFile = phasesFile.toLowerCase();
    if (!lowerFile.endsWith('.md') && !lowerFile.endsWith('.markdown')) {
      throw new Error(`Phases file should have .md or .markdown extension: ${phasesFile}`);
    }
  }

  private validateOutputDirectory(outputDir: string): void {
    // Check if path is provided
    if (!outputDir || outputDir.trim() === '') {
      throw new Error('Output directory path is required and cannot be empty');
    }

    // Check if path already exists
    if (fs.existsSync(outputDir)) {
      const stats = fs.statSync(outputDir);
      if (!stats.isDirectory()) {
        throw new Error(`Output path exists but is not a directory: ${outputDir}`);
      }

      // Check if directory is writable
      try {
        fs.accessSync(outputDir, fs.constants.W_OK);
      } catch (error) {
        throw new Error(`Output directory is not writable: ${outputDir}`);
      }
    } else {
      // Try to create the directory
      try {
        console.log(`Creating output directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
      } catch (error) {
        throw new Error(`Failed to create output directory: ${outputDir}. Error: ${error instanceof Error ? error.message : String(error)}`);
      }
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