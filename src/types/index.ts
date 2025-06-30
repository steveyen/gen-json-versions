// TypeScript type definitions for the application will be defined here.

export interface EmployeeDatabase {
  employees: Record<string, any>[];
  employeesById: Map<string, Record<string, any>>;
}

export interface EmployeeParserResult {
  success: boolean;
  data?: EmployeeDatabase;
  error?: string;
}