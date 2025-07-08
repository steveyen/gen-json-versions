// Core data generation engine will be implemented here.

import { EmpDatabase } from '../parser/emp-parser';
import { Phase } from '../parser/phases-parser';

export class DataGenerator {
    constructor(private phases: Phase[], private emps: EmpDatabase) {
    }

    generateData(): any[] {
        const result: any[] = [];

        for (const phase of this.phases) {
            const version = phase.version;

            const data: any[] = [];

            for (const jsonBlock of phase.jsonBlocks) {
                const obj = jsonBlock.colls;

                for (const key in obj) {
                    const value = obj[key];

                    data.push({
                        key,
                        value
                    });
                }
            }

            result.push({
                version,
                data
            });
        }

        return result;
    }
}
