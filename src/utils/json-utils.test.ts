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
      expect(result.result).toBe(`{
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
      expect(result.result).toBe(`{
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
      expect(result.result).toBe(`{
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
      expect(result.result).toBe(`{
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


});