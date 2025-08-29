import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  fileContainsCreateConfig,
  findDefineConfigCalls,
} from '../lib/vite/config-scanner';

describe('config-scanner', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-scanner-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('fileContainsCreateConfig', () => {
    it('should return true when file contains defineConfigEntry', () => {
      const filePath = path.join(tempDir, 'config.ts');
      fs.writeFileSync(
        filePath,
        `
        import { defineConfigEntry } from 'lib';
        export const appConfig = defineConfigEntry({
          name: 'app',
          schema: z.object({}),
        });
      `
      );

      const result = fileContainsCreateConfig(filePath);
      expect(result).toBe(true);
    });

    it('should return false when file does not contain defineConfigEntry', () => {
      const filePath = path.join(tempDir, 'other.ts');
      fs.writeFileSync(
        filePath,
        `
        import { something } from 'lib';
        export const config = { name: 'test' };
      `
      );

      const result = fileContainsCreateConfig(filePath);
      expect(result).toBe(false);
    });

    it('should return false when file does not exist', () => {
      const filePath = './non-existent-file.ts';
      const result = fileContainsCreateConfig(filePath);
      expect(result).toBe(false);
    });
  });

  describe('findDefineConfigCalls', () => {
    it('should find defineConfigEntry calls in TypeScript files', () => {
      // Create test directory structure
      const srcDir = path.join(tempDir, 'src');
      fs.mkdirSync(srcDir);

      const configFile = path.join(srcDir, 'config.ts');
      fs.writeFileSync(
        configFile,
        `
        import { defineConfigEntry } from 'lib';
        export const appConfig = defineConfigEntry({
          name: 'app',
          schema: z.object({}),
        });
      `
      );

      const result = findDefineConfigCalls({
        definitionDirs: [srcDir],
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'app',
        filePath: expect.stringContaining('src/config.ts'),
        exportName: 'appConfig',
      });
    });

    it('should find multiple defineConfigEntry calls', () => {
      const srcDir = path.join(tempDir, 'src');
      fs.mkdirSync(srcDir);

      const config1 = path.join(srcDir, 'config1.ts');
      fs.writeFileSync(
        config1,
        `
        export const dbConfig = defineConfigEntry({
          name: 'database',
          schema: z.object({}),
        });
      `
      );

      const config2 = path.join(srcDir, 'config2.ts');
      fs.writeFileSync(
        config2,
        `
        export const apiConfig = defineConfigEntry({
          name: 'api',
          schema: z.object({}),
        });
      `
      );

      const result = findDefineConfigCalls({
        definitionDirs: [srcDir],
      });

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual(['database', 'api']);
    });

    it('should handle files without name property', () => {
      const srcDir = path.join(tempDir, 'src');
      fs.mkdirSync(srcDir);

      const configFile = path.join(srcDir, 'config.ts');
      fs.writeFileSync(
        configFile,
        `
        export const myConfig = defineConfigEntry({
          schema: z.object({}),
        });
      `
      );

      const result = findDefineConfigCalls({
        definitionDirs: [srcDir],
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('myConfig'); // Should use export name
      expect(result[0].exportName).toBe('myConfig');
    });

    it('should return empty array when no configs found', () => {
      const srcDir = path.join(tempDir, 'src');
      fs.mkdirSync(srcDir);

      fs.writeFileSync(
        path.join(srcDir, 'other.ts'),
        `
        export const config = { name: 'test' };
      `
      );

      const result = findDefineConfigCalls({
        definitionDirs: [srcDir],
      });

      expect(result).toHaveLength(0);
    });

    it('should handle non-existent scan directories', () => {
      const result = findDefineConfigCalls({
        definitionDirs: ['./non-existent-dir'],
      });

      expect(result).toHaveLength(0);
    });
  });
});
