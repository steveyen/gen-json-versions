import * as fs from 'fs';
import * as path from 'path';

export interface FileCheckResult {
  error?: string;
  exists?: boolean;
  readable?: boolean;
  isFile?: boolean;
  size?: number;
}

export class FileUtils {
  /**
   * Comprehensive file existence and readability check
   */
  static checkFile(filePath: string): FileCheckResult {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          error: `File does not exist: ${filePath}`,
          exists: false
        };
      }

      // Get file stats
      const stats = fs.statSync(filePath);

      // Check if it's a file (not a directory)
      if (!stats.isFile()) {
        return {
          error: `Path is not a file: ${filePath}`,
          exists: true,
          isFile: false
        };
      }

      // Check if file is readable
      try {
        fs.accessSync(filePath, fs.constants.R_OK);
      } catch (accessError) {
        return {
          error: `File is not readable: ${filePath}`,
          exists: true,
          isFile: true,
          readable: false
        };
      }

      // Check file size
      if (stats.size === 0) {
        return {
          error: `File is empty: ${filePath}`,
          exists: true,
          isFile: true,
          readable: true,
          size: 0
        };
      }

      return {
        exists: true,
        isFile: true,
        readable: true,
        size: stats.size
      };
    } catch (error) {
      return {
        error: `Error checking file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Check if directory exists and is writable
   */
  static checkDirectory(dirPath: string): FileCheckResult {
    try {
      // Check if directory exists
      if (!fs.existsSync(dirPath)) {
        return {
          error: `Directory does not exist: ${dirPath}`,
          exists: false
        };
      }

      // Get directory stats
      const stats = fs.statSync(dirPath);

      // Check if it's a directory
      if (!stats.isDirectory()) {
        return {
          error: `Path is not a directory: ${dirPath}`,
          exists: true,
          isFile: false
        };
      }

      // Check if directory is writable
      try {
        fs.accessSync(dirPath, fs.constants.W_OK);
      } catch (accessError) {
        return {
          error: `Directory is not writable: ${dirPath}`,
          exists: true,
          isFile: false,
          readable: false
        };
      }

      return {
        exists: true,
        isFile: false,
        readable: true
      };
    } catch (error) {
      return {
        error: `Error checking directory: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  static ensureDirectoryExists(dirPath: string): FileCheckResult {
    try {
      if (fs.existsSync(dirPath)) {
        return this.checkDirectory(dirPath);
      }

      // Create directory recursively
      fs.mkdirSync(dirPath, { recursive: true });

      return {
        exists: true,
        isFile: false,
        readable: true
      };
    } catch (error) {
      return {
        error: `Failed to create directory: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Read file content as string
   */
  static readFile(filePath: string): { content?: string; error?: string } {
    try {
      const checkResult = this.checkFile(filePath);
      if (!checkResult.exists) {
        return { error: checkResult.error };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      return { content };
    } catch (error) {
      return {
        error: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Write content to file
   */
  static writeFile(filePath: string, content: string): { error?: string } {
    try {
      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      const dirResult = this.ensureDirectoryExists(dirPath);
      if (!dirResult.exists) {
        return { error: dirResult.error };
      }

      fs.writeFileSync(filePath, content, 'utf-8');
      return {};
    } catch (error) {
      return {
        error: `Failed to write file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}