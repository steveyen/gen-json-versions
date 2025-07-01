import * as fs from 'fs';

// TypeScript type definitions for employee parsing
export interface EmployeeDatabase {
  employees: Record<string, any>[];
  employeesById: Map<string, Record<string, any>>;
}

export interface EmployeesResult {
  result?: EmployeeDatabase;
  error?: string; // If error is present, the operation failed
}

export class EmployeeParser {
  /**
   * Parse employee data from a JSON file
   */
  static parseEmployeesFile(filePath: string): EmployeesResult {
    try {
      // Check if file exists and is readable
      if (!fs.existsSync(filePath)) {
        return {
          error: `Employee file not found: ${filePath}`
        };
      }

      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      const rawData = JSON.parse(fileContent);

      // Build employee database
      return this.buildEmployeeDatabase(rawData);
    } catch (error) {
      return {
        error: `Failed to parse employee file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Validate individual employee object - flexible validation
   */
  private static validateEmployee(employee: any, index: number): { error?: string } {
    // Basic validation: must be an object
    if (typeof employee !== 'object' || employee === null || Array.isArray(employee)) {
      return {
        error: `Employee at index ${index} must be an object`
      };
    }

    // Ensure the object has at least one property
    if (Object.keys(employee).length === 0) {
      return {
        error: `Employee at index ${index} cannot be an empty object`
      };
    }

    return {};
  }

  /**
   * Build employee database with indexed lookups
   */
  private static buildEmployeeDatabase(data: any[]): EmployeesResult {
    if (!Array.isArray(data)) {
      return {
        error: 'Employees data must be an array'
      };
    }

    for (let i = 0; i < data.length; i++) {
      const employee = data[i];

      const validationResult = this.validateEmployee(employee, i);
      if (validationResult.error) {
        return validationResult;
      }
    }

    const employeesById = new Map<string, Record<string, any>>();

    for (const employee of data) {
      // Index by ID if available
      if (employee.id && typeof employee.id === 'string') {
        employeesById.set(employee.id, employee);
      }
    }

    return {
      result: {
        employees: data,
        employeesById
      }
    };
  }
}