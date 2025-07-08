import * as fs from 'fs';

// TypeScript type definitions for emp parsing
export interface EmpDatabase {
  emps: Record<string, any>[];
  empsById: Map<string, Record<string, any>>;
}

export interface EmpsResult {
  result?: EmpDatabase;
  error?: string; // If error is present, the operation failed
}

export class EmpParser {
  /**
   * Parse emp data from a JSON file
   */
  static parseEmpsFile(filePath: string): EmpsResult {
    try {
      // Check if file exists and is readable
      if (!fs.existsSync(filePath)) {
        return {
          error: `Emp file not found: ${filePath}`
        };
      }

      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Build emp database
      return this.buildEmpDatabase(JSON.parse(fileContent));
    } catch (error) {
      return {
        error: `Failed to parse emp file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Validate individual emp object - flexible validation
   */
  private static validateEmp(emp: any, index: number): { error?: string } {
    // Basic validation: must be an object
    if (typeof emp !== 'object' || emp === null || Array.isArray(emp)) {
      return {
        error: `Emp at index ${index} must be an object`
      };
    }

    // Ensure the object has at least one property
    if (Object.keys(emp).length === 0) {
      return {
        error: `Emp at index ${index} cannot be an empty object`
      };
    }

    return {};
  }

  /**
   * Build emp database with indexed lookups
   */
  private static buildEmpDatabase(data: any): EmpsResult {
    const emps = data.emps;

    if (!Array.isArray(emps)) {
      return {
        error: 'Emps data must be an array'
      };
    }

    for (let i = 0; i < emps.length; i++) {
      const emp = emps[i];

      const validationResult = this.validateEmp(emp, i);
      if (validationResult.error) {
        return validationResult;
      }
    }

    const empsById = new Map<string, Record<string, any>>();

    for (const emp of emps) {
      // Index by ID if available
      if (emp.id && typeof emp.id === 'string') {
        empsById.set(emp.id, emp);
      }
    }

    return {
      result: {
        emps,
        empsById
      }
    };
  }
}