// Core data generation engine will be implemented here.

import { Phase, CodeBlock } from '../parser/phases-parser';
import { ValueKind, VALUE_KINDS_MAP } from '../parser/value-kinds';

export class DataGenerator {
    constructor(private phases: Phase[]) {
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
        const fieldsMetadata: any = jsonBlock.collsMetadata?.[collName]?.["[]"];

        let outObjResult: Record<string, any> = {};

        let nSub = 0;

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

                    const okV: [boolean, any] | undefined = valueKind?.generate?.({
                        colls: outColls,
                        obj: outObj,
                        pathKey,
                        fieldsMetadata,
                        n: exampleNum,
                        nSub,
                    });
                    if (okV) {
                        const [ok, v] = okV;
                        if (ok) {
                            outObj[fieldName] = v;
                        }
                    }

                    nSub += 1;
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

        if (fieldsMetadata) {
            for (const [fieldName, fieldMetadata] of Object.entries(fieldsMetadata)) {
                const pathKey = [collName, '[]', fieldName];

                processField(pathKey, fieldName, fieldMetadata, outObjResult);
            }
        }

        return outObjResult;
    }
}
