// Core data generation engine will be implemented here.

import { EmpDatabase } from '../parser/emp-parser';
import { Phase } from '../parser/phases-parser';

export class DataGenerator {
    constructor(private phases: Phase[], private emps: EmpDatabase) {
    }

    generateData(): any[] {
        const outPhases: any[] = [];

        for (const phase of this.phases) {
            const outColls: Record<string, any> = {};

            for (const jsonBlock of phase.jsonBlocks) {
                for (const [collName, coll] of Object.entries(jsonBlock.colls)) {
                    const objObjs: any[] = [];

                    for (const obj of coll as any[]) {
                        objObjs.push(obj);
                    }

                    outColls[collName] = objObjs;
                }
            }

            outPhases.push({
                version: phase.version,
                colls: outColls
            });
        }

        return outPhases;
    }
}
