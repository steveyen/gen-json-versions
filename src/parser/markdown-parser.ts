import { FileUtils } from '../utils/file-utils';
import { JsonUtils } from '../utils/json-utils';

export interface PhaseSection {
  version: string;
  name: string;
  startLine: number;
  endLine: number;
  content: string;
  jsonBlocks: CodeBlock[];
}

export interface CodeBlock {
  language: string; // Ex: 'json'.
  content: string;
  startLine: number;
  endLine: number;
  metadata: Record<string, any>;
  metadataFields?: Record<string, any>;
}

export interface MarkdownParseResult {
  phases?: PhaseSection[];
  error?: string; // If error is present, the operation failed
}

export class MarkdownParser {
  /**
   * Parse markdown file to identify phase sections
   */
  static parseMarkdownFile(filePath: string): MarkdownParseResult {
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
      const phases = this.extractPhaseSections(lines);

      if (phases.length === 0) {
        return {
          error: 'No phase sections found in markdown file'
        };
      }

      // Extract JSON code blocks from each phase
      for (const phase of phases) {
        phase.jsonBlocks = this.extractJsonCodeBlocks(phase.content, phase.startLine);

        // Process each JSON block for cleansing and metadata extraction
        for (const block of phase.jsonBlocks) {
          this.processJsonBlock(block);
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
  private static extractPhaseSections(lines: string[]): PhaseSection[] {
    const phases: PhaseSection[] = [];
    let currentPhase: PhaseSection | null = null;
    let phaseContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this line starts a new phase section
      const phaseMatch = this.matchPhaseHeader(line);
      if (phaseMatch) {
        // Save previous phase if exists
        if (currentPhase) {
          currentPhase.endLine = i - 1;
          currentPhase.content = phaseContent.join('\n');
          phases.push(currentPhase);
        }

        // Start new phase
        currentPhase = {
          version: phaseMatch.version,
          name: phaseMatch.name,
          startLine: i,
          endLine: lines.length - 1, // Will be updated when next phase is found
          content: '',
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

    return phases;
  }

  /**
   * Extract JSON code blocks from markdown content
   */
  private static extractJsonCodeBlocks(content: string, startOffset: number): CodeBlock[] {
    const blocks: CodeBlock[] = [];
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
          startLine: startOffset + i,
          metadata: {}
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
        if (currentBlock.content && this.isJsonBlock(currentBlock.language, currentBlock.content)) {
          blocks.push(currentBlock as CodeBlock);
        }

        currentBlock = null;
        continue;
      }

      // Add line to current block content
      if (inCodeBlock && currentBlock) {
        blockContent.push(line);
      }
    }

    return blocks;
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
  private static matchPhaseHeader(line: string): { version: string; name: string } | null {
    const trimmedLine = line.trim();

    // Pattern 1: "Data Version v1.0" - these are the actual version phases we want
    const dataVersionPattern = /^###\s+data\s+version\s+(v?\d+\.\d+(?:\.\d+)?)/i;
    const dataVersionMatch = trimmedLine.match(dataVersionPattern);
    if (dataVersionMatch) {
      return {
        version: dataVersionMatch[1],
        name: `Data Version ${dataVersionMatch[1]}`
      };
    }

    // Pattern 2: "Version v1.0" (without "Data" prefix) - also valid
    const versionPattern = /^###\s+version\s+(v?\d+\.\d+(?:\.\d+)?)/i;
    const versionMatch = trimmedLine.match(versionPattern);
    if (versionMatch) {
      return {
        version: versionMatch[1],
        name: `Version ${versionMatch[1]}`
      };
    }

    // Pattern 3: Custom version format like "v1.0", "v2.1.3" at level 3
    const customVersionPattern = /^###\s+(v\d+\.\d+(?:\.\d+)?)/i;
    const customMatch = trimmedLine.match(customVersionPattern);
    if (customMatch) {
      return {
        version: customMatch[1],
        name: `Version ${customMatch[1]}`
      };
    }

    // Note: We're intentionally NOT matching "Phase X" headers as they are
    // organizational sections, not actual version phases

    return null;
  }

  /**
   * Get phase section by version
   */
  static getPhaseByVersion(phases: PhaseSection[], version: string): PhaseSection | null {
    return phases.find(phase => phase.version === version) || null;
  }

  /**
   * Get phase section by name
   */
  static getPhaseByName(phases: PhaseSection[], name: string): PhaseSection | null {
    return phases.find(phase => phase.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Get all JSON blocks from all phases
   */
  static getAllJsonBlocks(phases: PhaseSection[]): CodeBlock[] {
    return phases.flatMap(phase => phase.jsonBlocks);
  }

  /**
   * Get JSON blocks by language
   */
  static getJsonBlocksByLanguage(phases: PhaseSection[], language: string): CodeBlock[] {
    return this.getAllJsonBlocks(phases).filter(block =>
      block.language.toLowerCase() === language.toLowerCase()
    );
  }

  /**
   * Process JSON block for cleansing and metadata extraction
   */
  private static processJsonBlock(block: CodeBlock): void {
    // Cleanse the JSON content
    const cleanseResult = JsonUtils.jsonCleanse(block.content);
    if (!cleanseResult.error && cleanseResult.cleanedJson) {
      block.content = cleanseResult.cleanedJson;
      // Try to parse the cleansed JSON
      try {
        const data = JSON.parse(cleanseResult.cleanedJson);
        // Extract metadata fields
        block.metadataFields = JsonUtils.extractMetadata(data);
      } catch (error) {
        // JSON parsing failed, but we still have the cleansed content
        console.warn(`Failed to parse JSON block: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Parse JSON content from a code block
   */
  static parseJsonBlock(block: CodeBlock): { data?: any; error?: string } {
    try {
      const data = JSON.parse(block.content);
      return { data };
    } catch (error) {
      return {
        error: `Failed to parse JSON block: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get all metadata fields from all phases
   */
  static getAllMetadataFields(phases: PhaseSection[]): Record<string, any> {
    const metadata: Record<string, any> = {};

    for (const phase of phases) {
      for (const block of phase.jsonBlocks) {
        if (block.metadataFields) {
          Object.assign(metadata, block.metadataFields);
        }
      }
    }

    return metadata;
  }

  /**
   * Get metadata fields for a specific phase
   */
  static getMetadataFieldsForPhase(phases: PhaseSection[], version: string): Record<string, any> {
    const phase = this.getPhaseByVersion(phases, version);
    if (!phase) return {};

    const metadata: Record<string, any> = {};
    for (const block of phase.jsonBlocks) {
      if (block.metadataFields) {
        Object.assign(metadata, block.metadataFields);
      }
    }

    return metadata;
  }

  /**
   * Validate phase sections
   */
  static validatePhases(phases: PhaseSection[]): { error?: string } {
    if (phases.length === 0) {
      return {
        error: 'No phases found'
      };
    }

    // Check for duplicate versions
    const versions = phases.map(p => p.version);
    const uniqueVersions = new Set(versions);
    if (uniqueVersions.size !== versions.length) {
      return {
        error: 'Duplicate version numbers found in phases'
      };
    }

    // Check for valid version format
    const versionPattern = /^v?\d+\.\d+(?:\.\d+)?$/;
    for (const phase of phases) {
      if (!versionPattern.test(phase.version)) {
        return {
          error: `Invalid version format: ${phase.version}`
        };
      }
    }

    return {};
  }
}