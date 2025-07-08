// Core data generation engine will be implemented here.

import { EmpDatabase } from '../parser/emp-parser';
import { Phase } from '../parser/phases-parser';

export class DataGenerator {
    constructor(private phases: Phase[], private employees: EmpDatabase) {
    }

    generateData(): any[] {
        return [];
    }
}
