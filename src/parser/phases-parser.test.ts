import { PhasesParser, Phase } from './phases-parser';

describe('PhasesParser', () => {
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
        content: mockContent
      });

      const result = PhasesParser.parseFile('test.md');

      expect(result.error).toBeFalsy();
      expect(result.phases).toHaveLength(2);
      expect(result.phases![0].version).toBe('v1.0');
      expect(result.phases![1].version).toBe('v2.0');

      // Restore original function
      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });

    it('should handle file read errors', () => {
      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        error: 'File not found'
      });

      const result = PhasesParser.parseFile('nonexistent.md');

      expect(result.error).toBeTruthy();
      expect(result.error).toBe('File not found');

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
  "^description": {"about": "User data schema"},
  "^maxLength": {"num": 50}
}
\`\`\``;

      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        content: mockContent
      });

      const result = PhasesParser.parseFile('test.md');

      expect(result.error).toBeFalsy();
      expect(result.phases).toHaveLength(1);

      const phase = result.phases![0];
      expect(phase.jsonBlocks).toHaveLength(1);

      const block = phase.jsonBlocks[0];
      expect(block.content).not.toContain('// User name');
      expect(block.content).not.toContain('/* User age */');
      expect(block.collsMetadata).toEqual({
        'description': {'about': 'User data schema'},
        'maxLength': {'num': 50},
        'name': {
          'valueKinds': {'string': 1},
          'values': ['John']
        },
        'status': {
          '[]': {
            'valueKinds': {'string': 3},
            'values': ['active', 'inactive', 'pending']
          }
        }
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
        content: mockContent
      });

      const result = PhasesParser.parseFile('test.md');

      expect(result.error).toBeFalsy();
      expect(result.phases![0].version).toBe('v1.0');

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });

    it('should detect "Version v1.0" pattern', () => {
      const mockContent = `### Version v2.0
Content here`;

      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        content: mockContent
      });

      const result = PhasesParser.parseFile('test.md');

      expect(result.error).toBeFalsy();
      expect(result.phases![0].version).toBe('v2.0');

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });

    it('should detect custom version format', () => {
      const mockContent = `### v3.0
Content here`;

      const originalReadFile = require('../utils/file-utils').FileUtils.readFile;
      require('../utils/file-utils').FileUtils.readFile = jest.fn().mockReturnValue({
        content: mockContent
      });

      const result = PhasesParser.parseFile('test.md');

      expect(result.error).toBeFalsy();
      expect(result.phases![0].version).toBe('v3.0');

      require('../utils/file-utils').FileUtils.readFile = originalReadFile;
    });
  });

  describe('utility methods', () => {
    let mockPhases: Phase[];

    beforeEach(() => {
      mockPhases = [
        {
          version: 'v1.0',
          begLine: 1,
          endLine: 10,
          content: 'Phase 1 content',
          codeBlocks: [],
          jsonBlocks: [
            {
              language: 'json',
              content: '{"name": "John", "status": ["active", "inactive"]}',
              begLine: 3,
              endLine: 5,
              collsMetadata: { 'description': 'User data' }
            }
          ]
        },
        {
          version: 'v2.0',
          begLine: 11,
          endLine: 20,
          content: 'Phase 2 content',
          codeBlocks: [],
          jsonBlocks: [
            {
              language: 'json',
              content: '{"name": "Jane", "age": 25}',
              begLine: 13,
              endLine: 15,
              collsMetadata: { 'description': 'Employee data' }
            }
          ]
        }
      ];
    });

    it('should get phase by version', () => {
      const phase = PhasesParser.getPhaseByVersion(mockPhases, 'v1.0');
      expect(phase).toBe(mockPhases[0]);
    });

    it('should get all JSON blocks', () => {
      const blocks = PhasesParser.getAllJsonBlocks(mockPhases);
      expect(blocks).toHaveLength(2);
    });

    it('should collect metadata from all phases', () => {
      const allMetadata: Record<string, any> = {};
      for (const phase of mockPhases) {
        for (const block of phase.jsonBlocks) {
          if (block.collsMetadata) {
            Object.assign(allMetadata, block.collsMetadata);
          }
        }
      }

      expect(allMetadata).toEqual({
        'description': 'Employee data' // Last one wins
      });
    });

    it('should get metadata fields for specific phase', () => {
      const phase = PhasesParser.getPhaseByVersion(mockPhases, 'v2.0');
      expect(phase).toBeTruthy();

      const metadata: Record<string, any> = {};
      for (const block of phase!.jsonBlocks) {
        if (block.collsMetadata) {
          Object.assign(metadata, block.collsMetadata);
        }
      }

      expect(metadata).toEqual({
        'description': 'Employee data'
      });
    });
  });

  describe('validation', () => {
    it('should validate phases successfully', () => {
      const phases: Phase[] = [
        {
          version: 'v1.0',
          begLine: 1,
          endLine: 10,
          content: 'Content',
          codeBlocks: [],
          jsonBlocks: [{ language: 'json', content: '{}', begLine: 1, endLine: 1, collsMetadata: {} }]
        }
      ];

      const result = PhasesParser.validatePhases(phases);
      expect(result.error).toBeFalsy();
    });

    it('should reject empty phases', () => {
      const result = PhasesParser.validatePhases([]);
      expect(result.error).toBe('No phases found');
    });

    it('should reject phases with duplicate versions', () => {
      const phases: Phase[] = [
        {
          version: 'v1.0',
          begLine: 1,
          endLine: 10,
          content: 'Content',
          codeBlocks: [],
          jsonBlocks: [{ language: 'json', content: '{}', begLine: 1, endLine: 1, collsMetadata: {} }]
        },
        {
          version: 'v1.0',
          begLine: 11,
          endLine: 20,
          content: 'Content',
          codeBlocks: [],
          jsonBlocks: [{ language: 'json', content: '{}', begLine: 11, endLine: 11, collsMetadata: {} }]
        }
      ];

      const result = PhasesParser.validatePhases(phases);
      expect(result.error).toBe('Duplicate phase versions found');
    });

    it('should reject phases without JSON blocks', () => {
      const phases: Phase[] = [
        {
          version: 'v1.0',
          begLine: 1,
          endLine: 10,
          content: 'Content',
          codeBlocks: [],
          jsonBlocks: []
        }
      ];

      const result = PhasesParser.validatePhases(phases);
      expect(result.error).toBe('Phase v1.0 has no JSON blocks');
    });
  });

  describe('metadata extraction', () => {
    it('should extract metadata fields with ^ prefix', () => {
      const input = {
        name: 'John',
        age: 30,
        '^description': {'about': 'User data'},
        '^maxLength': {num: 50},
        address: {
          street: '123 Main St',
          '^city': {'name': 'New York'}
        }
      };

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({
        'description': {'about': 'User data'},
        'maxLength': {'num': 50},
        'name': {
          'valueKinds': {'string': 1},
          'values': ['John']
        },
        'address': {
          'street': {
            'valueKinds': {'string': 1},
            'values': ['123 Main St']
          },
          'city': {
            'name': 'New York'
          }
        }
      });
    });

    it('should handle nested metadata fields', () => {
      const input = {
        user: {
          '^type': {'level': 'admin'},
          profile: {
            '^version': {'semver': '1.0'}
          }
        }
      };

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({
        'user': {
          'type': {'level': 'admin'},
          'profile': {
            'version': {'semver': '1.0'}
          }
        }
      });
    });

    it('should handle arrays with metadata', () => {
      const input = {
        items: [
          { name: 'item1', '^category': {'val': 'electronics'} },
          { name: 'item2', '^category': {'val': 'books'} }
        ]
      };

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({
        'items': {
          '[]': {
            'category': {
              'val': 'books'
            },
            'name': {
              'valueKinds': {'string': 2},
              'values': ['item1', 'item2']
            }
          }
        }
      });
    });

    it('should handle arrays with string values', () => {
      const input = {
        status: ['active', 'inactive', 'pending']
      };

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({
        'status': {
          '[]': {
            'valueKinds': {'string': 3},
            'values': ['active', 'inactive', 'pending']
          }
        }
      });
    });

    it('should handle nested arrays', () => {
      const input = {
        users: [
          {
            name: 'John',
            roles: ['admin', 'user']
          },
          {
            name: 'Jane',
            roles: ['user']
          }
        ]
      };

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({
        'users': {
          '[]': {
            'name': {
              'valueKinds': {'string': 2},
              'values': ['John', 'Jane']
            },
            'roles': {
              '[]': {
                'valueKinds': {'string': 3},
                'values': ['admin', 'user']
              }
            }
          }
        }
      });
    });

    it('should handle mixed data types', () => {
      const input = {
        '^schema': {'name': 'user'},
        name: 'John',
        age: 30,
        active: true,
        tags: ['dev', 'admin'],
        profile: {
          '^version': {'semver': '2.0'},
          bio: 'Developer',
          skills: ['JavaScript', 'TypeScript']
        }
      };

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({
        'schema': {'name': 'user'},
        'name': {
          'valueKinds': {'string': 1},
          'values': ['John']
        },
        'profile': {
          'version': {'semver': '2.0'},
          'bio': {
            'valueKinds': {'string': 1},
            'values': ['Developer']
          },
          'skills': {
            '[]': {
              'valueKinds': {'string': 2},
              'values': ['JavaScript', 'TypeScript']
            }
          }
        },
        'tags': {
          '[]': {
            'valueKinds': {'string': 2},
            'values': ['dev', 'admin']
          }
        }
      });
    });

    it('should handle empty objects', () => {
      const input = {};

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({});
    });

    it('should handle null and undefined values', () => {
      const input = {
        name: 'John',
        age: null,
        email: undefined,
        '^description': {'about': 'Test'}
      };

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({
        'description': {'about': 'Test'},
        'name': {
          'valueKinds': {'string': 1},
          'values': ['John']
        }
      });
    });

    it('should handle complex nested structures', () => {
      const input = {
        '^collection': {'name': 'employees'},
        data: [
          {
            '^id': {'value': 'emp1'},
            name: 'John',
            department: {
              '^code': {'value': 'IT'},
              name: 'Information Technology',
              teams: ['Dev', 'QA']
            }
          },
          {
            '^id': {'value': 'emp2'},
            name: 'Jane',
            department: {
              '^code': {'value': 'HR'},
              name: 'Human Resources',
              teams: ['Recruitment']
            }
          }
        ]
      };

      const result = (PhasesParser as any).extractCollsMetadata(input);
      expect(result).toEqual({
        'collection': {'name': 'employees'},
        'data': {
          '[]': {
            'id': {'value': 'emp2'},
            'name': {
              'valueKinds': {'string': 2},
              'values': ['John', 'Jane']
            },
            'department': {
              'code': {'value': 'HR'},
              'name': {
                'valueKinds': {'string': 2},
                'values': ['Information Technology', 'Human Resources']
              },
                              'teams': {
                  '[]': {
                    'valueKinds': {'string': 3},
                    'values': ['Dev', 'QA', 'Recruitment']
                  }
                }
            }
          }
        }
      });
    });
  });
});