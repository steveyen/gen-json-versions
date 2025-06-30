# AI / Agentic task management for teams.

# Bakery Scheduling Test Data Generator

This tool generates test data for a bakery scheduling system,
supporting multiple phases of data evolution:

1. Basic employee and shift data
2. Employee roles and defined shifts
3. Employee unavailability and time off
4. Multiple locations and location-specific shifts
5. Labor cost tracking and budget management

## Installation

```bash
npm install
```

## Usage

### Generate all phases

```bash
npm run generate
```

### Generate specific phase

```bash
npm run generate -- -p 3
```

### Command Line Options

- `-s, --start-date <date>`: Start date for the test data (YYYY-MM-DD), defaults to 2024-01-01
- `-r, --records <number>`: Number of records to generate, defaults to 30
- `-e, --employees <number>`: Number of employees to generate, defaults to 15
- `-o, --output-dir <path>`: Output directory for the generated data, defaults to 'data'
- `-p, --phase <number>`: Specific phase to generate (1-5), or "all" for all phases, defaults to "all"

### Examples

Generate data for Phase 3 with 20 employees and 50 records:
```bash
npm run generate -- -p 3 -e 20 -r 50
```

Generate data for all phases with a custom start date:
```bash
npm run generate -- -s 2024-03-01
```

## Output

The generated test data will be saved in JSON files in the specified output directory (default: `test-data/`):

- `phase1.json`: Basic employee and shift data
- `phase2.json`: Employee roles and defined shifts
- `phase3.json`: Employee unavailability and time off
- `phase4.json`: Multiple locations and location-specific shifts
- `phase5.json`: Labor cost tracking and budget management

## Development

### Building

```bash
npm run build
```

### Running

```bash
npm start
```

