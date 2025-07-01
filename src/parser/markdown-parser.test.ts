import { MarkdownParser, PhaseSection } from './markdown-parser';

describe('MarkdownParser', () => {
  describe('parseMarkdownFile', () => {
    it('should parse markdown file with phase sections', () => {
      const mockContent = `# Test Document

### Data Version v1.0
This is phase 1 content.

\`\`\`json
{
  "name": "John",
  "age": 30
}
\`\`\`

### Data Version v2.0
This is phase 2 content.

\`\`\`json
{
  "name": "Jane",
  "age": 25
}
\`\`\``;

      // Mock FileUtils.readFile
      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        success: true,
        content: mockContent
      });

      const result = MarkdownParser.parseMarkdownFile('test.md');

      expect(result.success).toBe(true);
      expect(result.phases).toHaveLength(2);
      expect(result.phases![0].version).toBe('v1.0');
      expect(result.phases![1].version).toBe('v2.0');

      // Restore original function
      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });

    it('should handle file read errors', () => {
      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        success: false,
        error: 'File not found'
      });

      const result = MarkdownParser.parseMarkdownFile('nonexistent.md');

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });

    it('should handle markdown files without phase sections', () => {
      const mockContent = `# Test Document

This is a regular markdown file without phase sections.

\`\`\`json
{
  "name": "John"
}
\`\`\``;

      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        success: true,
        content: mockContent
      });

      const result = MarkdownParser.parseMarkdownFile('test.md');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No phase sections found in markdown file');

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });
  });

  describe('JSON cleansing and metadata extraction', () => {
    it('should cleanse JSON with comments and extract metadata', () => {
      const mockContent = `# Test Document

### Data Version v1.0

\`\`\`json
{
  "name": "John", // User name
  "age": 30, /* User age */
  "status": ["active", "inactive", "pending"],
  "^description": "User data schema",
  "^maxLength": 50
}
\`\`\``;

      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        success: true,
        content: mockContent
      });

      const result = MarkdownParser.parseMarkdownFile('test.md');

      expect(result.success).toBe(true);
      expect(result.phases).toHaveLength(1);

      const phase = result.phases![0];
      expect(phase.jsonBlocks).toHaveLength(1);

      const block = phase.jsonBlocks[0];
      expect(block.content).not.toContain('// User name');
      expect(block.content).not.toContain('/* User age */');
      expect(block.metadataFields).toEqual({
        'description': "User data schema",
        'maxLength': 50
      });

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });
  });

  describe('phase detection patterns', () => {
    it('should detect "Data Version v1.0" pattern', () => {
      const mockContent = `### Data Version v1.0
Content here`;

      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        success: true,
        content: mockContent
      });

      const result = MarkdownParser.parseMarkdownFile('test.md');

      expect(result.success).toBe(true);
      expect(result.phases![0].version).toBe('v1.0');
      expect(result.phases![0].name).toBe('Data Version v1.0');

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });

    it('should detect "Version v1.0" pattern', () => {
      const mockContent = `### Version v2.0
Content here`;

      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        success: true,
        content: mockContent
      });

      const result = MarkdownParser.parseMarkdownFile('test.md');

      expect(result.success).toBe(true);
      expect(result.phases![0].version).toBe('v2.0');
      expect(result.phases![0].name).toBe('Version v2.0');

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });

    it('should detect custom version format', () => {
      const mockContent = `### v3.0
Content here`;

      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        success: true,
        content: mockContent
      });

      const result = MarkdownParser.parseMarkdownFile('test.md');

      expect(result.success).toBe(true);
      expect(result.phases![0].version).toBe('v3.0');
      expect(result.phases![0].name).toBe('Version v3.0');

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });
  });

  describe('utility methods', () => {
    let mockPhases: PhaseSection[];

    beforeEach(() => {
      mockPhases = [
        {
          version: 'v1.0',
          name: 'Data Version v1.0',
          startLine: 1,
          endLine: 10,
          content: 'Phase 1 content',
          jsonBlocks: [
            {
              language: 'json',
              content: '{"name": "John", "status": ["active", "inactive"]}',
              startLine: 3,
              endLine: 5,
              metadata: {},
              metadataFields: { 'description': 'User data' }
            }
          ]
        },
        {
          version: 'v2.0',
          name: 'Data Version v2.0',
          startLine: 11,
          endLine: 20,
          content: 'Phase 2 content',
          jsonBlocks: [
            {
              language: 'json',
              content: '{"name": "Jane", "roles": ["admin", "user"]}',
              startLine: 13,
              endLine: 15,
              metadata: {},
              metadataFields: { 'maxLength': 100 }
            }
          ]
        }
      ];
    });

    it('should get phase by version', () => {
      const phase = MarkdownParser.getPhaseByVersion(mockPhases, 'v1.0');
      expect(phase).toBe(mockPhases[0]);
    });

    it('should get phase by name', () => {
      const phase = MarkdownParser.getPhaseByName(mockPhases, 'Data Version v2.0');
      expect(phase).toBe(mockPhases[1]);
    });

    it('should get all JSON blocks', () => {
      const blocks = MarkdownParser.getAllJsonBlocks(mockPhases);
      expect(blocks).toHaveLength(2);
    });

    it('should get JSON blocks by language', () => {
      const blocks = MarkdownParser.getJsonBlocksByLanguage(mockPhases, 'json');
      expect(blocks).toHaveLength(2);
    });



    it('should get all metadata fields', () => {
      const metadata = MarkdownParser.getAllMetadataFields(mockPhases);
      expect(metadata).toEqual({
        'description': 'User data',
        'maxLength': 100
      });
    });



    it('should get metadata fields for specific phase', () => {
      const metadata = MarkdownParser.getMetadataFieldsForPhase(mockPhases, 'v2.0');
      expect(metadata).toEqual({
        'maxLength': 100
      });
    });
  });

  describe('validation', () => {
    it('should validate phases successfully', () => {
      const phases: PhaseSection[] = [
        {
          version: 'v1.0',
          name: 'Version 1',
          startLine: 1,
          endLine: 10,
          content: 'Content',
          jsonBlocks: []
        },
        {
          version: 'v2.0',
          name: 'Version 2',
          startLine: 11,
          endLine: 20,
          content: 'Content',
          jsonBlocks: []
        }
      ];

      const result = MarkdownParser.validatePhases(phases);
      expect(result.success).toBe(true);
    });

    it('should reject empty phases', () => {
      const result = MarkdownParser.validatePhases([]);
      expect(result.success).toBe(false);
      expect(result.error).toBe('No phases found');
    });

    it('should reject duplicate versions', () => {
      const phases: PhaseSection[] = [
        {
          version: 'v1.0',
          name: 'Version 1',
          startLine: 1,
          endLine: 10,
          content: 'Content',
          jsonBlocks: []
        },
        {
          version: 'v1.0',
          name: 'Version 1 Duplicate',
          startLine: 11,
          endLine: 20,
          content: 'Content',
          jsonBlocks: []
        }
      ];

      const result = MarkdownParser.validatePhases(phases);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Duplicate version numbers found in phases');
    });

    it('should reject invalid version format', () => {
      const phases: PhaseSection[] = [
        {
          version: 'invalid-version',
          name: 'Invalid Version',
          startLine: 1,
          endLine: 10,
          content: 'Content',
          jsonBlocks: []
        }
      ];

      const result = MarkdownParser.validatePhases(phases);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid version format: invalid-version');
    });
  });
});