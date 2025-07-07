import { FileUtils } from '../utils/file-utils';
import { JsonUtils } from '../utils/json-utils';

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

        jsonBlock.obj = JSON.parse(jsonBlock.content);

        jsonBlock.objMetadata = this.extractObjMetadata(jsonBlock.obj);
    }

    /**
     * Extract metadata fields (fields starting with ^) from a JSON object,
     * and remove these metadata fields from the object.
     */
    private static extractObjMetadata(obj: any): Record<string, any> {
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

                        const valueKind = PhasesParser.analyzeValueKind(obj, pathKey, m, v);

                        m.valueKinds ||= {}
                        m.valueKinds[valueKind] ||= 0;
                        m.valueKinds[valueKind]++;
                    }

                    if (typeof val === 'object' && val !== null) {
                        // Recursively process nested objects
                        processObj(val, pathKey);
                    }
                }
            }
        };

        processObj(obj, []);

        return metadata;
    }

    private static analyzeValueKind(obj: any, pathKey: string[], m: Record<string, any>, v: string): string {
        // If it looks like a datetime, return 'datetime'
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(v) ||
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(v)) {
            return 'datetime';
        }

        // If it looks like a date, return 'date'
        if (/^\d{4}-\d{2}-\d{2}$/.test(v) || /^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
            return 'date';
        }

        // If it looks like a time, return 'time'
        if (/^\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(v) || /^\d{2}:\d{2}$/.test(v)) {
            return 'time';
        }

        // If it looks like a currency, return 'currency'
        if (/^\$[\d,]+(\.\d{2})?$/.test(v) || /^[\d,]+(\.\d{2})?\s*USD$/.test(v)) {
            return 'currency';
        }

        // If it looks like a percentage, return 'percentage'
        if (/^\d+(\.\d+)?%$/.test(v)) {
            return 'percentage';
        }

        // If it looks like a phone number, return 'phone'
        if (/^\+?[\d\s\-\(\)]{10,}$/.test(v) && /[\d]{10,}/.test(v.replace(/[\s\-\(\)]/g, ''))) {
            return 'phone';
        }

        // If it looks like an email, return 'email'
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            return 'email';
        }

        // If it looks like a URL, return 'url'
        if (/^https?:\/\/.+/.test(v) || /^www\..+/.test(v)) {
            return 'url';
        }

        // If it looks like an IP address, return 'ip'
        if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) {
            return 'ip';
        }

        // If it looks like a MAC address, return 'mac'
        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(v)) {
            return 'mac';
        }

        // If it looks like a UUID, return 'uuid'
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
            return 'uuid';
        }

        // If it looks like a number, return 'number'
        if (/^\d+(\.\d+)?$/.test(v)) {
            return 'number';
        }

        // If it looks like a boolean, return 'boolean'
        if (/^(true|false|yes|no|1|0)$/i.test(v)) {
            return 'boolean';
        }

        // If it looks like a list (comma-separated), return 'list'
        if (v.includes(',') && v.split(',').length > 1) {
            return 'list';
        }

        // If it looks like a duration, return 'duration'
        if (/^\d+[dhms]$/.test(v) || /^\d+:\d+:\d+$/.test(v)) {
            return 'duration';
        }

        // If it looks like a location (coordinates), return 'location'
        if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(v)) {
            return 'location';
        }

        // If it looks like an employee ID, return 'emp'
        if (/^emp-\d+$/i.test(v) || /^employee-\d+$/i.test(v)) {
            return 'emp';
        }

        // If it looks like an object ID, return 'id'
        if (/^[a-f0-9]{24}$/i.test(v) || /^id-\d+$/i.test(v)) {
            return 'id';
        }

        // If it looks like a string, return 'string'
        if (typeof v === 'string' && v.length > 0) {
            return 'string';
        }

        // Default fallback
        return 'unknown';
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
