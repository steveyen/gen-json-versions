import { FileUtils } from '../utils/file-utils';

export interface PhaseSection {
  version: string;
  name: string;
  startLine: number;
  endLine: number;
  content: string;
  jsonBlocks: JsonCodeBlock[];
}

export interface JsonCodeBlock {
  language: string;
  content: string;
  startLine: number;
  endLine: number;
  metadata: Record<string, any>;
}

export interface MarkdownParseResult {
  success: boolean;
  phases?: PhaseSection[];
  error?: string;
}

export class MarkdownParser {
  /**
   * Parse markdown file to identify phase sections
   */
  static parseMarkdownFile(filePath: string): MarkdownParseResult {
    try {
      // Read the markdown file
      const readResult = FileUtils.readFile(filePath);
      if (!readResult.success) {
        return {
          success: false,
          error: readResult.error
        };
      }

      const content = readResult.content!;
      const lines = content.split('\n');

            // Find all phase sections
      const phases = this.extractPhaseSections(lines);

      if (phases.length === 0) {
        return {
          success: false,
          error: 'No phase sections found in markdown file'
        };
      }

      // Extract JSON code blocks from each phase
      for (const phase of phases) {
        phase.jsonBlocks = this.extractJsonCodeBlocks(phase.content, phase.startLine);
      }

      return {
        success: true,
        phases
      };
    } catch (error) {
      return {
        success: false,
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
  private static extractJsonCodeBlocks(content: string, startOffset: number): JsonCodeBlock[] {
    const blocks: JsonCodeBlock[] = [];
    const lines = content.split('\n');
    let inCodeBlock = false;
    let currentBlock: Partial<JsonCodeBlock> | null = null;
    let blockContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for code block start
      const codeBlockStart = line.match(/^```(\w+)?$/);
      if (codeBlockStart && !inCodeBlock) {
        inCodeBlock = true;
        currentBlock = {
          language: codeBlockStart[1] || '',
          startLine: startOffset + i,
          metadata: {}
        };
        blockContent = [];
        continue;
      }

      // Check for code block end
      if (line.match(/^```$/) && inCodeBlock && currentBlock) {
        inCodeBlock = false;
        currentBlock.endLine = startOffset + i;
        currentBlock.content = blockContent.join('\n');

        // Only include JSON blocks
        if (currentBlock.content && this.isJsonBlock(currentBlock.language, currentBlock.content)) {
          blocks.push(currentBlock as JsonCodeBlock);
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

    // Try to parse as JSON to validate
    try {
      JSON.parse(trimmedContent);
      return true;
    } catch {
      // Not valid JSON
      return false;
    }
  }

  /**
   * Match phase header patterns like "Version v1.0", "Phase 1", etc.
   */
  private static matchPhaseHeader(line: string): { version: string; name: string } | null {
    const trimmedLine = line.trim();

    // Pattern 1: "Version v1.0" or "Version 1.0"
    const versionPattern = /^#+\s*version\s+(v?\d+\.\d+(?:\.\d+)?)/i;
    const versionMatch = trimmedLine.match(versionPattern);
    if (versionMatch) {
      return {
        version: versionMatch[1],
        name: `Version ${versionMatch[1]}`
      };
    }

    // Pattern 2: "Phase 1", "Phase 2", etc.
    const phasePattern = /^#+\s*phase\s+(\d+)/i;
    const phaseMatch = trimmedLine.match(phasePattern);
    if (phaseMatch) {
      return {
        version: `v${phaseMatch[1]}.0`,
        name: `Phase ${phaseMatch[1]}`
      };
    }

    // Pattern 3: "Stage 1", "Stage 2", etc.
    const stagePattern = /^#+\s*stage\s+(\d+)/i;
    const stageMatch = trimmedLine.match(stagePattern);
    if (stageMatch) {
      return {
        version: `v${stageMatch[1]}.0`,
        name: `Stage ${stageMatch[1]}`
      };
    }

    // Pattern 4: "Step 1", "Step 2", etc.
    const stepPattern = /^#+\s*step\s+(\d+)/i;
    const stepMatch = trimmedLine.match(stepPattern);
    if (stepMatch) {
      return {
        version: `v${stepMatch[1]}.0`,
        name: `Step ${stepMatch[1]}`
      };
    }

    // Pattern 5: Custom version format like "v1.0", "v2.1.3"
    const customVersionPattern = /^#+\s*(v\d+\.\d+(?:\.\d+)?)/i;
    const customMatch = trimmedLine.match(customVersionPattern);
    if (customMatch) {
      return {
        version: customMatch[1],
        name: `Version ${customMatch[1]}`
      };
    }

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
  static getAllJsonBlocks(phases: PhaseSection[]): JsonCodeBlock[] {
    return phases.flatMap(phase => phase.jsonBlocks);
  }

  /**
   * Get JSON blocks by language
   */
  static getJsonBlocksByLanguage(phases: PhaseSection[], language: string): JsonCodeBlock[] {
    return this.getAllJsonBlocks(phases).filter(block =>
      block.language.toLowerCase() === language.toLowerCase()
    );
  }

  /**
   * Parse JSON content from a code block
   */
  static parseJsonBlock(block: JsonCodeBlock): { success: boolean; data?: any; error?: string } {
    try {
      const data = JSON.parse(block.content);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse JSON block: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Validate phase sections
   */
  static validatePhases(phases: PhaseSection[]): { success: boolean; error?: string } {
    if (phases.length === 0) {
      return {
        success: false,
        error: 'No phases found'
      };
    }

    // Check for duplicate versions
    const versions = phases.map(p => p.version);
    const uniqueVersions = new Set(versions);
    if (uniqueVersions.size !== versions.length) {
      return {
        success: false,
        error: 'Duplicate version numbers found in phases'
      };
    }

    // Check for valid version format
    const versionPattern = /^v?\d+\.\d+(?:\.\d+)?$/;
    for (const phase of phases) {
      if (!versionPattern.test(phase.version)) {
        return {
          success: false,
          error: `Invalid version format: ${phase.version}`
        };
      }
    }

    return { success: true };
  }
}