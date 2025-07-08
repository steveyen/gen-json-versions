import { FileUtils } from '../utils/file-utils';
import { JsonUtils } from '../utils/json-utils';
import { analyzeValueKind } from './value-kinds';

export interface Phase {
    version: string;

    content: string;
    begLine: number;
    endLine: number;

    codeBlocks: CodeBlock[]; // All code blocks in the phase
    jsonBlocks: CodeBlock[]; // All JSON blocks in the phase (subset of codeBlocks)
}

export interface PhasesParseResult {
    phases?: Phase[];
    error?: string; // If error is present, the operation failed
}

export interface CodeBlock {
    language: string; // Ex: 'json'.

    content: string;
    begLine: number;
    endLine: number;

    colls?: any;
    collsMetadata?: Record<string, any>;
}

export class PhasesParser {
    /**
     * Parse markdown file to identify phase sections
     */
    static parseFile(filePath: string): PhasesParseResult {
        try {
            // Read the markdown file
            const readResult = FileUtils.readFile(filePath);
            if (readResult.error) {
                return {
                    error: readResult.error
                };
            }

            const lines = readResult.content!.split('\n');

            // Find all phase sections
            const phases = this.extractPhases(lines);

            // Extract JSON code blocks from each phase
            for (const phase of phases) {
                const result = this.processCodeBlocks(phase.content, phase.begLine);

                phase.codeBlocks = result.codeBlocks;
                phase.jsonBlocks = result.jsonBlocks;

                // Process each JSON block for cleansing and metadata extraction
                for (const jsonBlock of phase.jsonBlocks) {
                    this.processJsonBlock(jsonBlock);
                }
            }

            return {
                phases
            };
        } catch (error) {
            return {
                error: `Failed to parse markdown file: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * Extract phase sections from markdown lines
     */
    private static extractPhases(lines: string[]): Phase[] {
        const phases: Phase[] = [];

        let currentPhase: Phase | null = null;

        let phaseContent: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if this line starts a new phase section
            const version = this.matchPhaseHeader(line);
            if (version) {
                // Save previous phase if exists
                if (currentPhase) {
                    currentPhase.endLine = i - 1;
                    currentPhase.content = phaseContent.join('\n');
                    phases.push(currentPhase);
                }

                // Start new phase
                currentPhase = {
                    version,
                    begLine: i,
                    endLine: lines.length - 1, // Will be updated when next phase is found
                    content: '',
                    codeBlocks: [],
                    jsonBlocks: []
                };

                phaseContent = [line];
            } else if (currentPhase) {
                // Add line to current phase content
                phaseContent.push(line);
            }
        }

        // Save the last phase
        if (currentPhase) {
            currentPhase.endLine = lines.length - 1;
            currentPhase.content = phaseContent.join('\n');

            phases.push(currentPhase);
        }

        return phases
    }

    /**
     * Extract JSON code blocks from markdown content
     */
    private static processCodeBlocks(content: string, startOffset: number): { codeBlocks: CodeBlock[], jsonBlocks: CodeBlock[] } {
        const codeBlocks: CodeBlock[] = [];
        const jsonBlocks: CodeBlock[] = [];

        const lines = content.split('\n');

        let inCodeBlock = false;
        let currentBlock: Partial<CodeBlock> | null = null;
        let blockContent: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check for code block start
            const codeBlockStart = line.match(/^```(\w+)?\s*({.*)?$/);
            if (codeBlockStart && !inCodeBlock) {
                inCodeBlock = true;
                currentBlock = {
                    language: (codeBlockStart[1] || '').toLowerCase(),
                    begLine: startOffset + i
                };
                blockContent = [];

                // If there's content on the same line as the opening backticks, add it to block content
                if (codeBlockStart[2]) {
                    blockContent.push(codeBlockStart[2]);
                }
                continue;
            }

            // Check for code block end
            if (line.match(/^```$/) && inCodeBlock && currentBlock) {
                inCodeBlock = false;
                currentBlock.endLine = startOffset + i;
                currentBlock.content = blockContent.join('\n');

                // Only include JSON blocks
                if (currentBlock.content) {
                    codeBlocks.push(currentBlock as CodeBlock);

                    if (this.isJsonBlock(currentBlock.language, currentBlock.content)) {
                        jsonBlocks.push(currentBlock as CodeBlock);
                    }
                }

                currentBlock = null;
                continue;
            }

            // Add line to current block content
            if (inCodeBlock && currentBlock) {
                blockContent.push(line);
            }
        }

        return { codeBlocks, jsonBlocks };
    }

    /**
     * Check if a code block contains JSON content
     */
    private static isJsonBlock(language: string | undefined, content: string): boolean {
        // Check if language is explicitly JSON
        if (language && language.toLowerCase() === 'json') {
            return true;
        }
        // Check if content looks like JSON (starts with { or [)
        const trimmedContent = content.trim();
        if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
            return true;
        }
        return false;
    }

    /**
     * Match phase header patterns like "Version v1.0", "Phase 1", etc.
     */
    private static matchPhaseHeader(line: string): string | null {
        const trimmedLine = line.trim();

        // Pattern 1: "Data Version v1.0" - these are the actual version phases we want
        const dataVersionPattern = /^###\s+data\s+version\s+(v?\d+\.\d+(?:\.\d+)?)/i;
        const dataVersionMatch = trimmedLine.match(dataVersionPattern);
        if (dataVersionMatch) {
            return dataVersionMatch[1];
        }

        // Pattern 2: "Version v1.0" - alternative format
        const versionPattern = /^###\s+version\s+(v?\d+\.\d+(?:\.\d+)?)/i;
        const versionMatch = trimmedLine.match(versionPattern);
        if (versionMatch) {
            return versionMatch[1];
        }

        // Pattern 3: "v1.0" - simple version format
        const simpleVersionPattern = /^###\s+(v?\d+\.\d+(?:\.\d+)?)/i;
        const simpleVersionMatch = trimmedLine.match(simpleVersionPattern);
        if (simpleVersionMatch) {
            return simpleVersionMatch[1];
        }

        return null;
    }

    /**
     * Process a JSON block to cleanse it and extract metadata
     */
    private static processJsonBlock(jsonBlock: CodeBlock): void {
        // Cleanse the JSON content (remove comments, etc.)
        const cleanseResult = JsonUtils.jsonCleanse(jsonBlock.content);
        if (cleanseResult.error) {
            // If cleansing fails, keep original content
            return;
        }

        jsonBlock.content = cleanseResult.result!;

        jsonBlock.colls = JSON.parse(jsonBlock.content);

        jsonBlock.collsMetadata = this.extractCollsMetadata(jsonBlock.colls);
    }

    /**
     * Extract metadata fields (fields starting with ^) from a JSON object,
     * and remove these metadata fields from the object.
     */
    private static extractCollsMetadata(colls: any): Record<string, any> {
        const metadata: Record<string, any> = {};

        function metadataPathChild(path: string[]): Record<string, any> {
            let m = metadata;

            for (let p of path) {
                if (!m[p]) {
                    m[p] = {};
                }

                m = m[p];
            }

            return m;
        }

        const processObj = (obj: any, path: string[]) => {
            if (obj !== null && typeof obj === 'object') {
                const isArray = Array.isArray(obj);

                for (let [key, val] of Object.entries(obj)) {
                    if (isArray) {
                        key = '[]';
                    }

                    if (key.startsWith('^')) { // Process metadata fields like ^fieldName first
                        let m = metadataPathChild(path.concat(key.substring(1)));

                        Object.assign(m, val);

                        delete obj[key]; // Remove the metadata field from the object
                    }
                }

                for (let [key, val] of Object.entries(obj)) {
                    if (isArray) {
                        key = '[]';
                    }

                    const pathKey = path.concat(key);

                    if (typeof val === 'string') {
                        let m = metadataPathChild(pathKey);
                        if (!m.values) {
                            m.values = [];
                        }

                        const v = (val as string).trim();

                        if (!m.values.includes(v)) {
                            m.values.push(v);
                        }

                        const valueKind = analyzeValueKind(obj, pathKey, m, v);
                        if (valueKind) {
                            m.valueKinds ||= {}
                            m.valueKinds[valueKind] ||= 0;
                            m.valueKinds[valueKind]++;
                        }
                    }

                    if (typeof val === 'object' && val !== null) {
                        // Recursively process nested objects
                        processObj(val, pathKey);
                    }
                }
            }
        };

        processObj(colls, []);

        return metadata;
    }

    /**
     * Validate phases for consistency and completeness
     */
    static validatePhases(phases: Phase[]): { error?: string } {
        if (!phases || phases.length === 0) {
            return { error: 'No phases found' };
        }

        // Check for duplicate versions
        const versions = phases.map(phase => phase.version);

        const uniqueVersions = new Set(versions);
        if (versions.length !== uniqueVersions.size) {
            return { error: 'Duplicate phase versions found' };
        }

        // Check that each phase has at least one JSON block
        for (const phase of phases) {
            if (!phase.jsonBlocks || phase.jsonBlocks.length === 0) {
                return { error: `Phase ${phase.version} has no JSON blocks` };
            }
        }

        return {}; // No errors
    }

    /**
     * Get a specific phase by version
     */
    static getPhaseByVersion(phases: Phase[], version: string): Phase | null {
        return phases.find(phase => phase.version === version) || null;
    }

    /**
     * Get all JSON blocks from all phases
     */
    static getAllJsonBlocks(phases: Phase[]): CodeBlock[] {
        return phases.flatMap(phase => phase.jsonBlocks);
    }
}
