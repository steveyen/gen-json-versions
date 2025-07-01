import { FileUtils } from '../utils/file-utils';

export interface PhaseSection {
  version: string;
  name: string;
  startLine: number;
  endLine: number;
  content: string;
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
          content: ''
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