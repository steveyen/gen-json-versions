# Product Requirements Document: JSON Data Generator CLI Tool

## Introduction/Overview

The JSON Data Generator CLI Tool is a command-line utility that generates realistic sample JSON data files based on business evolution phases described in markdown documentation. The tool takes employee data and phase descriptions as input, then produces separate JSON files for each phase that reflect the schema evolution and business growth described in the narrative.

This tool solves the problem of creating realistic, consistent sample datasets for testing and development purposes, particularly useful when working with applications that have evolving data schemas over time.

## Goals

1. Generate separate JSON files for each phase described in the input markdown file
2. Maintain consistency of employee data across all generated phases
3. Create realistic sample data that follows the schema evolution described in each phase
4. Provide a simple, developer-friendly CLI interface
5. Parse JSON examples from markdown documentation to guide data generation
6. Remain flexible for many business scenarios

## User Stories

1. **As a developer**, I want to generate sample data for different phases of my application so that I can test how my code handles schema evolution.

2. **As a developer**, I want consistent employee data across all phases so that I can test data migration scenarios realistically.

3. **As a developer**, I want the tool to parse JSON examples from markdown documentation so that I don't have to manually extract schema information.

4. **As a developer**, I want separate output files for each phase so that I can easily compare data structures between versions.

5. **As a developer**, I want realistic sample data that follows the provided business phases so that the sample data reflect what the business needs.

## Functional Requirements

1. **Command Line Interface**: The system must accept three command-line arguments: employee data file path, phases markdown file path, and output directory path.

2. **File Parsing**: The system must parse the employee JSON file to extract employee records for use across all phases.

3. **Markdown Parsing**: The system must parse the phases markdown file to identify phase sections and extract JSON examples from each phase.

4. **Phase Detection**: The system must identify distinct phases in the markdown file (e.g., "Version v1.0", etc.) and create corresponding output files.

5. **JSON Example Extraction**: The system must extract and cleanse JSON code blocks from the markdown file and use their structure to guide data generation. Especially, the JSON code blocks may have C/C++ style comments, which are not supported by formal JSON syntax.

6. **Employee Data Integration**: The system must use employee records from the input JSON file consistently across all generated phases.

7. **Schema Evolution Support**: The system must generate data that follows the schema changes described in each phase (e.g., adding new fields, changing field names, introducing new entities).

8. **Realistic Data Generation**: The system must generate realistic sample data that makes business sense (e.g., appropriate dates, logical relationships between entities).

9. **File Output**: The system must create separate JSON files for each phase with appropriate naming (e.g., `phase-v1.0.json`, `phase-v2.0.json`).

10. **Data Consistency**: The system must maintain referential integrity across generated data (e.g., employee IDs referenced in the sample data must exist in the employee list).

## Non-Goals (Out of Scope)

1. **JSON Schema Validation**: The system will not validate generated JSON against formal schemas (future feature).

2. **Configuration Options**: The system will not support custom configuration for data generation parameters (future feature).

3. **Advanced Error Handling**: The system will not include comprehensive error handling for malformed input files (future feature). Stack dumps are okay for now.

4. **Documentation Generation**: The system will not generate additional documentation files explaining each phase (future feature).

5. **Interactive Mode**: The system will not provide an interactive interface for data generation.

6. **Data Visualization**: The system will not include tools for visualizing or analyzing the generated data.

7. **Database Integration**: The system will not directly integrate with databases or data stores.

8. **Quality of Life Affordances**: Progress bar indicators and colorful, emoji output are not needed (future feature).

## Design Considerations

### CLI Interface Design
- Simple, intuitive command structure: `generate emp.json phases.md ./output-dir/`

### File Naming Convention
- Output files should follow the pattern: `phase-v{version}.json`
- Version numbers should be extracted from the markdown phase file
- Files should be created in the specified output directory

### Data Generation Strategy
- Use employee data from input file as the source of truth
- Generate proper dates, times, and business data
- Maintain relationships between entities
- Follow the schema structure shown in JSON examples from markdown

## Technical Considerations

### Markdown Parsing
- Parse markdown to identify phase sections and version numbers
- Extract and cleanse JSON code blocks using markdown syntax recognition
- Handle nested code blocks and formatting variations

### JSON Processing
- Parse employee data file to build employee database
- Generate realistic sample data based on extracted sample schemas from the phases.md input
- Maintain data consistency across phases

### File I/O
- Read input files with proper error handling
- Write output files with pretty JSON formatting
- Create output directory if it doesn't exist

### Dependencies
- Markdown parsing library for extracting content
- JSON processing library for data manipulation
- File system utilities for directory and file operations

## Success Metrics

1. **Functionality**: Successfully generates JSON files for all phases described in the input markdown file.

2. **Data Quality**: Generated data maintains referential integrity and business logic consistency.

3. **Developer Experience**: CLI tool is easy to use and provides clear feedback.

4. **Extensibility**: Tool structure supports different business scenarios.

5. **Performance**: Tool completes data generation in reasonable time (< 30 seconds for typical inputs).

## Open Questions

None
