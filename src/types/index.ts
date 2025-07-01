// TypeScript type definitions for the application will be defined here.

export interface EmployeeDatabase {
  employees: Record<string, any>[];
  employeesById: Map<string, Record<string, any>>;
}

export interface EmployeeParserResult {
  data?: EmployeeDatabase;
  error?: string; // If error is present, the operation failed
}