# Task List: JSON Data Generator CLI Tool

## Relevant Files

- `src/cli.ts` - Main CLI entry point and argument parsing
- `src/cli.test.ts` - Unit tests for CLI argument handling
- `jest.config.js` - Jest testing configuration
- `src/parser/employee-parser.ts` - Flexible employee JSON file parsing logic with basic validation and database building
- `src/parser/employee-parser.test.ts` - Unit tests for employee parsing
- `src/parser/markdown-parser.ts` - Markdown phase detection and JSON extraction
- `src/parser/markdown-parser.test.ts` - Unit tests for markdown parsing
- `src/generator/data-generator.ts` - Core data generation engine
- `src/generator/data-generator.test.ts` - Unit tests for data generation
- `src/utils/json-utils.ts` - JSON processing utilities (cleansing, validation)
- `src/utils/json-utils.test.ts` - Unit tests for JSON utilities
- `src/utils/file-utils.ts` - File I/O operations and directory management
- `src/utils/file-utils.test.ts` - Unit tests for file operations
- `src/types/index.ts` - TypeScript type definitions for flexible EmployeeDatabase and EmployeeParserResult
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest testing configuration

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 CLI Interface Setup
  - [x] 1.1 Create main CLI entry point with argument validation
  - [x] 1.2 Implement command-line argument parsing for employee file, phases file, and output directory
  - [x] 1.3 Add basic error handling for missing or invalid arguments
  - [x] 1.4 Set up project structure with TypeScript configuration
  - [x] 1.5 Create package.json with necessary dependencies (markdown parser, JSON utilities)

- [x] 2.0 File Parsing and Input Handling
  - [x] 2.1 Create employee parser module to read and validate employee JSON file
  - [x] 2.2 Implement employee data structure validation and error handling
  - [x] 2.3 Build employee database in memory for consistent use across phases
  - [x] 2.4 Add file existence and readability checks for input files
  - [x] 2.5 Create utility functions for file I/O operations

- [x] 3.0 Markdown Phase Detection and JSON Extraction
  - [x] 3.1 Implement markdown parser to identify phase sections (e.g., "Version v1.0")
  - [x] 3.2 Create JSON code block extraction logic from markdown content
  - [x] 3.3 Add command-line logging to print loaded versions for early sanity checking
  - [x] 3.4 Implement JSON cleansing to remove C/C++ style comments from extracted JSON
  - [x] 3.5 Build phase metadata extraction (version numbers, phase names)
  - [x] 3.6 Extract valid value enumerations from JSON examples for data generation
  - [x] 3.7 Value metadata is available in related fields with a prefix caret ('^'), like "^fieldName".

- [ ] 4.0 Data Generation Engine
  - [ ] 4.1 Create core data generator that uses employee data consistently
  - [ ] 4.2 Implement realistic data generation for dates, times, and business data
  - [ ] 4.3 Build schema-aware data generation that follows extracted JSON structures
  - [ ] 4.4 Implement referential integrity maintenance across generated data
  - [ ] 4.5 Create business logic for generating realistic relationships between entities
  - [ ] 4.6 Add deterministic algorithms for consistent data generation (no AI/LLM calls)

- [ ] 5.0 Output File Management and Integration
  - [ ] 5.1 Implement output directory creation if it doesn't exist
  - [ ] 5.2 Create file naming convention following pattern `phase-v{version}.json`
  - [ ] 5.3 Implement pretty JSON formatting for output files
  - [ ] 5.4 Add integration logic to coordinate all components (parsing, generation, output)
  - [ ] 5.5 Create main orchestration function that processes all phases sequentially
