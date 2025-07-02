import { FileUtils } from '../utils/file-utils';
import { JsonUtils } from '../utils/json-utils';

export interface Phase {
    version: string;

    content: string;
    begLine: number;
    endLine: number;

    codeBlocks: CodeBlock[]; // All code blocks in the phase
    jsonBlocks: CodeBlock[]; // All JSON blocks in the phase
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

    obj?: any;
    objMetadata?: Record<string, any>;
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

            const content = readResult.content!;
            const lines = content.split('\n');

            // Find all phase sections
            const phases = this.extractPhases(lines);

            if (phases.length === 0) {
                return {
                    error: 'No phase sections found in markdown file'
                };
            }

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

        jsonBlock.obj = JSON.parse(jsonBlock.content);

        jsonBlock.objMetadata = this.extractObjMetadata(jsonBlock.obj);
    }

    /**
     * Extract metadata fields (fields starting with ^) from a JSON object,
     * and remove these metadata fields from the object.
     */
    private static extractObjMetadata(obj: any): Record<string, any> {
        const metadata: Record<string, any> = {};

        const process = (obj: any, path: string = '') => {
            if (typeof obj === 'object' && obj !== null) {
                for (const [key, value] of Object.entries(obj)) {
                    const currentPath = path ? `${path}.${key}` : key;

                    if (key.startsWith('^')) {
                        // This is a metadata field
                        const metadataKey = key.substring(1); // Remove the ^ prefix

                        metadata[metadataKey] = value;

                        delete obj[key];
                    } else if (typeof value === 'object' && value !== null) {
                        // Recursively process nested objects
                        process(value, currentPath);
                    }
                }
            }
        };

        process(obj);

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
