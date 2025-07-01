import * as fs from 'fs';

// TypeScript type definitions for employee parsing
export interface EmployeeDatabase {
  employees: Record<string, any>[];
  employeesById: Map<string, Record<string, any>>;
}

export interface EmployeeParserResult {
  data?: EmployeeDatabase;
  error?: string; // If error is present, the operation failed
}

export class EmployeeParser {
  /**
   * Parse employee data from a JSON file
   */
  static parseEmployeeFile(filePath: string): EmployeeParserResult {
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

      // Validate the data structure
      const validationResult = this.validateEmployeeData(rawData);
      if (validationResult.error) {
        return {
          error: validationResult.error
        };
      }

      // Build employee database
      const employeeDatabase = this.buildEmployeeDatabase(rawData);

      return {
        data: employeeDatabase
      };
    } catch (error) {
      return {
        error: `Failed to parse employee file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Validate employee data structure - flexible validation
   */
  private static validateEmployeeData(data: any): { error?: string } {
    if (!Array.isArray(data)) {
      return {
        error: 'Employee data must be an array'
      };
    }

    if (data.length === 0) {
      return {
        error: 'Employee data array cannot be empty'
      };
    }

    for (let i = 0; i < data.length; i++) {
      const employee = data[i];

      const validationResult = this.validateEmployee(employee, i);
      if (validationResult.error) {
        return validationResult;
      }
    }

    return {};
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
  private static buildEmployeeDatabase(employees: any[]): EmployeeDatabase {
    const employeesById = new Map<string, Record<string, any>>();

    for (const employee of employees) {
      // Index by ID if available
      if (employee.id && typeof employee.id === 'string') {
        employeesById.set(employee.id, employee);
      }
    }

    return {
      employees,
      employeesById
    };
  }
}