// Core data generation engine will be implemented here.

import { EmpDatabase } from '../parser/emp-parser';
import { Phase, CodeBlock } from '../parser/phases-parser';
import { ValueKind, VALUE_KINDS_MAP } from '../parser/value-kinds';

export class DataGenerator {
    constructor(private phases: Phase[], private emps: EmpDatabase) {
    }

    generatePhasesCollsObjs(numExamplesPerPhase?: number): any[] {
        if (!numExamplesPerPhase) {
            numExamplesPerPhase = 3;
        }

        const outColls: Record<string, any> = {};

        const outPhases: any[] = [];

        for (let phaseIndex = 0; phaseIndex < this.phases.length; phaseIndex++) {
            const phase = this.phases[phaseIndex];

            const outPhaseColls: Record<string, any> = {};

            for (const jsonBlock of phase.jsonBlocks) {
                for (const [collName, collExamples] of Object.entries(jsonBlock.colls)) {
                    if (collName === 'emps') {
                        continue; // TODO: add emps to the output.
                    }

                    const outColl = outColls[collName] = outColls[collName] || [];

                    const outPhaseColl = outPhaseColls[collName] = outPhaseColls[collName] || [];

                    const collExamplesArr = collExamples as any[];

                    for (let i = 0; i < collExamplesArr.length; i++) {
                        const collExample = collExamplesArr[i];

                        for (let j = 0; j < numExamplesPerPhase; j++) {
                            let objExample = this.generatePhaseCollObj(outColls, phaseIndex, phase, jsonBlock, collName, collExamplesArr, i, collExample,
                                outColl.length);

                            outColl.push(objExample);

                            outPhaseColl.push(objExample);
                        }
                    }
                }
            }

            outPhases.push({
                version: phase.version,
                colls: outPhaseColls
            });
        }

        return outPhases;
    }

    private generatePhaseCollObj(outColls: Record<string, any>,
        phaseIndex: number, phase: Phase, jsonBlock: CodeBlock,
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
                        const kind: string = valueKindsEntries[0][0]; // Ex: 'id'.

                        const valueKind: ValueKind = VALUE_KINDS_MAP[kind];

                        // TODO: The pathKey should be the full path to the field?
                        const pathKey = [collName, '[]', fieldName];

                        const okV: [boolean, any] | undefined = valueKind?.generate?.(outColls, outObj, pathKey, collExampleMetadata, exampleNum);
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
