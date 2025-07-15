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

            // Add some more emps from the emp database.
            const empsToAddNum = Math.floor(this.emps.emps.length / this.phases.length);
            const empsToAdd = this.emps.emps.slice(empsToAddNum * phaseIndex, empsToAddNum * (phaseIndex + 1));
            for (const emp of empsToAdd) {
                outColls.emps = outColls.emps || [];
                outColls.emps.push(emp);

                outPhaseColls.emps = outPhaseColls.emps || [];
                outPhaseColls.emps.push(emp);
            }

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
                            let objExample = this.generatePhaseCollObj(outColls,
                                phaseIndex, jsonBlock,
                                collName, collExamplesArr, i, collExample,
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
        phaseIndex: number, jsonBlock: CodeBlock,
        collName: string, collExamples: any[], collExampleIndex: number, collExample: any,
        exampleNum: number): any {
        const collExampleMetadata: any = jsonBlock.collsMetadata?.[collName]?.["[]"];

        let outObjResult: Record<string, any> = {};

        // Recursive.
        const processField = (pathKey: string[], fieldName: string, fieldMetadata: any, outObj: Record<string, any>) => {
            console.log("^^^", pathKey, fieldName, JSON.stringify(fieldMetadata, null, 1));

            const valueKinds = fieldMetadata.valueKinds;
            if (valueKinds &&
                typeof valueKinds === 'object') {
                const valueKindsEntries = Object.entries(valueKinds);
                if (valueKindsEntries.length > 0) {
                    // TODO: Use valueKindEntries better -- perhaps finding item with max entries?
                    const kind: string = valueKindsEntries[0][0]; // Ex: 'id'.

                    const valueKind: ValueKind = VALUE_KINDS_MAP[kind];

                    const okV: [boolean, any] | undefined = valueKind?.generate?.(outColls, outObj,
                        pathKey, collExampleMetadata, exampleNum);
                    if (okV) {
                        const [ok, v] = okV;
                        if (ok) {
                            outObj[fieldName] = v;
                        }
                    }
                }

                return;
            }

            const subFieldsMetadata = fieldMetadata['[]'];
            if (subFieldsMetadata) {
                outObj[fieldName] = [];

                for (let i = 0; i < 2; i++) {
                    const outObjSub = {};

                    for (const [subFieldName, subFieldMetadata] of Object.entries(subFieldsMetadata)) {
                        processField(pathKey.concat('[]', subFieldName), subFieldName, subFieldMetadata, outObjSub);
                    }

                    outObj[fieldName].push(outObjSub);
                }
            }
        }

        if (collExampleMetadata) {
            for (const [fieldName, fieldMetadata] of Object.entries(collExampleMetadata)) {
                const pathKey = [collName, '[]', fieldName];

                processField(pathKey, fieldName, fieldMetadata, outObjResult);
            }
        }

        return outObjResult;
    }
}
