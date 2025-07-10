// Core data generation engine will be implemented here.

import { EmpDatabase } from '../parser/emp-parser';
import { Phase, CodeBlock } from '../parser/phases-parser';

export class DataGenerator {
    constructor(private phases: Phase[], private emps: EmpDatabase) {
    }

    generatePhasesExampleObjs(numExamples?: number): any[] {
        if (!numExamples) {
            numExamples = 3;
        }

        const outPhases: any[] = [];

        for (let phaseIndex = 0; phaseIndex < this.phases.length; phaseIndex++) {
            const phase = this.phases[phaseIndex];

            const outColls: Record<string, any> = {};

            for (const jsonBlock of phase.jsonBlocks) {
                for (const [collName, collExamples] of Object.entries(jsonBlock.colls)) {
                    if (collName === 'emps') {
                        continue; // TODO: add emps to the output.
                    }

                    const outObjs = outColls[collName] || [];

                    const collExamplesArr = collExamples as any[];

                    for (let i = 0; i < collExamplesArr.length; i++) {
                        const collExample = collExamplesArr[i];

                        for (let i = 0; i < numExamples; i++) {
                            let objExample = this.generatePhaseCollObj(phaseIndex, phase, jsonBlock, collName, collExamplesArr, i, collExample);

                            outObjs.push(objExample);
                        }
                    }

                    outColls[collName] = outObjs;
                }
            }

            outPhases.push({
                version: phase.version,
                colls: outColls
            });
        }

        return outPhases;
    }

    private generatePhaseCollObj(phaseIndex: number, phase: Phase, jsonBlock: CodeBlock,
        collName: string, collExamples: any[], collExampleIndexi: number, collExample: any): any {
        return collExample;
    }
}
