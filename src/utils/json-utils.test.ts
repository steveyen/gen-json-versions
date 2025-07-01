import { JsonUtils } from './json-utils';

describe('JsonUtils', () => {
  describe('cleanseJson', () => {
    it('should remove single-line comments', () => {
      const input = `{
        "name": "John", // This is a comment
        "age": 30
      }`;

      const result = JsonUtils.jsonCleanse(input);

      expect(result.error).toBeFalsy();
      expect(result.cleanedJson).toBe(`{
        "name": "John",
        "age": 30
      }`);
    });

    it('should remove multi-line comments', () => {
      const input = `{
        "name": "John", /* This is a
        multi-line comment */
        "age": 30
      }`;

      const result = JsonUtils.jsonCleanse(input);

      expect(result.error).toBeFalsy();
      expect(result.cleanedJson).toBe(`{
        "name": "John",
        "age": 30
      }`);
    });

    it('should preserve comments within strings', () => {
      const input = `{
        "name": "John // This should be preserved",
        "comment": "/* This should also be preserved */",
        "age": 30
      }`;

      const result = JsonUtils.jsonCleanse(input);

      expect(result.error).toBeFalsy();
      expect(result.cleanedJson).toBe(`{
        "name": "John // This should be preserved",
        "comment": "/* This should also be preserved */",
        "age": 30
      }`);
    });

    it('should handle escape sequences in strings', () => {
      const input = `{
        "path": "C:\\\\Users\\\\John", // Windows path
        "quote": "He said \\"Hello\\"",
        "age": 30
      }`;

      const result = JsonUtils.jsonCleanse(input);

      expect(result.error).toBeFalsy();
      expect(result.cleanedJson).toBe(`{
        "path": "C:\\\\Users\\\\John",
        "quote": "He said \\"Hello\\"",
        "age": 30
      }`);
    });

    it('should handle empty input', () => {
      const result = JsonUtils.jsonCleanse('');

      expect(result.error).toBeTruthy();
      expect(result.error).toBe('Invalid input: jsonContent must be a non-empty string');
    });

    it('should handle null input', () => {
      const result = JsonUtils.jsonCleanse(null as any);

      expect(result.error).toBeTruthy();
      expect(result.error).toBe('Invalid input: jsonContent must be a non-empty string');
    });
  });







  describe('extractMetadataFields', () => {
    it('should extract metadata fields with caret prefix', () => {
      const input = {
        name: "John",
        "^description": "User metadata",
        "^maxLength": 50,
        address: {
          street: "123 Main St",
          "^required": true
        }
      };

      const result = JsonUtils.extractMetadataFields(input);

      expect(result).toEqual({
        'description': "User metadata",
        'maxLength': 50,
        'required': true
      });
    });

    it('should handle nested metadata fields', () => {
      const input = {
        user: {
          "^type": "object",
          name: "John",
          settings: {
            "^default": "enabled",
            theme: "dark"
          }
        }
      };

      const result = JsonUtils.extractMetadataFields(input);

      expect(result).toEqual({
        'type': "object",
        'default': "enabled"
      });
    });

    it('should return empty object when no metadata fields', () => {
      const input = {
        name: "John",
        age: 30,
        address: {
          street: "123 Main St"
        }
      };

      const result = JsonUtils.extractMetadataFields(input);

      expect(result).toEqual({});
    });
  });

  describe('formatJson', () => {
    it('should format JSON with default indentation', () => {
      const input = { name: "John", age: 30 };

      const result = JsonUtils.formatJson(input);

      expect(result).toBe('{\n  "name": "John",\n  "age": 30\n}');
    });

    it('should format JSON with custom indentation', () => {
      const input = { name: "John", age: 30 };

      const result = JsonUtils.formatJson(input, 4);

      expect(result).toBe('{\n    "name": "John",\n    "age": 30\n}');
    });

    it('should throw error for invalid data', () => {
      const input: any = { circular: null };
      input.circular = input; // Create circular reference

      expect(() => JsonUtils.formatJson(input)).toThrow('Failed to format JSON');
    });
  });

  describe('cloneJson', () => {
    it('should deep clone JSON data', () => {
      const input = {
        name: "John",
        age: 30,
        address: {
          street: "123 Main St",
          city: "New York"
        },
        hobbies: ["reading", "swimming"]
      };

      const result = JsonUtils.cloneJson(input);

      expect(result).toEqual(input);
      expect(result).not.toBe(input); // Should be a different reference
      expect(result.address).not.toBe(input.address); // Nested objects should also be cloned
    });

    it('should throw error for circular references', () => {
      const input: any = { name: "John" };
      input.self = input; // Create circular reference

      expect(() => JsonUtils.cloneJson(input)).toThrow('Failed to clone JSON');
    });
  });
});