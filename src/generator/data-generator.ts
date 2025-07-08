// Core data generation engine will be implemented here.

import { EmployeeDatabase } from '../parser/employee-parser';
import { Phase } from '../parser/phases-parser';

export class DataGenerator {
    constructor(private phases: Phase[], private employees: EmployeeDatabase) {
    }

    generateData(): any[] {
        return [];
    }
}
