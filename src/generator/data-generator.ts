// Core data generation engine will be implemented here.

import { EmpDatabase } from '../parser/emp-parser';
import { Phase, CodeBlock } from '../parser/phases-parser';
import { ValueKind, VALUE_KINDS_MAP } from '../parser/value-kinds';

export class DataGenerator {
    constructor(private phases: Phase[], private emps: EmpDatabase) {
    }

    generatePhasesCollsObjs(numExamples?: number): any[] {
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

                        for (let j = 0; j < numExamples; j++) {
                            let objExample = this.generatePhaseCollObj(phaseIndex, phase, jsonBlock, collName, collExamplesArr, i, collExample, j);

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
        collName: string, collExamples: any[], collExampleIndex: number, collExample: any,
        exampleNum: number): any {
        const collExampleMetadata: any = jsonBlock.collsMetadata?.[collName]?.["[]"];

        let outObj: Record<string, any> = {};

        if (collExampleMetadata) {
            for (const [fieldName, fieldMetadata] of Object.entries(collExampleMetadata)) {
                const valueKinds = (fieldMetadata as any).valueKinds;

                if (valueKinds && typeof valueKinds === 'object') {
                    const valueKindsEntries = Object.entries(valueKinds);
                    if (valueKindsEntries.length > 0) {
                        const kind: string = valueKindsEntries[0][0];
                        const valueKind: ValueKind = VALUE_KINDS_MAP[kind];

                        // TODO: The pathKey should be the full path to the field
                        const pathKey = [fieldName];

                        const okV: [boolean, any] | undefined = valueKind?.generate?.(outObj, pathKey, collExampleMetadata, exampleNum);
                        if (okV) {
                            const [ok, v] = okV;
                            if (ok && v) {
                                outObj[fieldName] = v;
                            }
                        }
                    }
                }
            }
        }

        return outObj;
    }
}
