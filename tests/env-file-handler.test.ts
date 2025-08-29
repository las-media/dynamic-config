import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  copyEnvFile,
  handleEnvFileBundle,
  normalizeEnvFileConfig,
} from '../lib/vite/env-file-handler';
import type { EnvFileConfig } from '../lib/vite/types';

describe('env-file-handler', () => {
  let tempDir: string;
  let testFilePath: string;

  beforeEach(() => {
    // Create temporary directory for tests
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dynamic-config-test-'));
    testFilePath = path.join(tempDir, 'test-env.json');

    // Create test file
    fs.writeFileSync(testFilePath, JSON.stringify({ test: 'data' }), 'utf8');
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('normalizeEnvFileConfig', () => {
    it('should return null when envFile is undefined', () => {
      const result = normalizeEnvFileConfig(undefined);
      expect(result).toBeNull();
    });

    it('should extract filename from simple path', () => {
      const result = normalizeEnvFileConfig('./env.json');
      expect(result).toEqual({
        source: './env.json',
        target: 'env.json',
      });
    });

    it('should extract filename from nested path', () => {
      const result = normalizeEnvFileConfig('./src/config.json');
      expect(result).toEqual({
        source: './src/config.json',
        target: 'config.json',
      });
    });

    it('should extract filename from deeply nested path', () => {
      const result = normalizeEnvFileConfig(
        './environment/production/prod.json'
      );
      expect(result).toEqual({
        source: './environment/production/prod.json',
        target: 'prod.json',
      });
    });

    it('should handle absolute paths', () => {
      const result = normalizeEnvFileConfig('/absolute/path/data.json');
      expect(result).toEqual({
        source: '/absolute/path/data.json',
        target: 'data.json',
      });
    });

    it('should handle paths without extension', () => {
      const result = normalizeEnvFileConfig('./config/settings');
      expect(result).toEqual({
        source: './config/settings',
        target: 'settings',
      });
    });
  });

  describe('copyEnvFile', () => {
    it('should copy file to target directory', () => {
      const outDir = path.join(tempDir, 'dist');
      const envConfig: EnvFileConfig = {
        source: testFilePath,
        target: 'copied-env.json',
      };

      copyEnvFile(envConfig, outDir);

      const targetPath = path.join(outDir, 'copied-env.json');
      expect(fs.existsSync(targetPath)).toBe(true);

      const content = fs.readFileSync(targetPath, 'utf8');
      expect(content).toBe('{"test":"data"}');
    });

    it('should create target directory if it does not exist', () => {
      const outDir = path.join(tempDir, 'nested', 'dist');
      const envConfig: EnvFileConfig = {
        source: testFilePath,
        target: 'env.json',
      };

      copyEnvFile(envConfig, outDir);

      const targetPath = path.join(outDir, 'env.json');
      expect(fs.existsSync(targetPath)).toBe(true);
    });

    it('should handle nested target paths', () => {
      const outDir = path.join(tempDir, 'dist');
      const envConfig: EnvFileConfig = {
        source: testFilePath,
        target: 'config/env.json',
      };

      copyEnvFile(envConfig, outDir);

      const targetPath = path.join(outDir, 'config', 'env.json');
      expect(fs.existsSync(targetPath)).toBe(true);

      const content = fs.readFileSync(targetPath, 'utf8');
      expect(content).toBe('{"test":"data"}');
    });

    it('should not throw when source file does not exist', () => {
      const outDir = path.join(tempDir, 'dist');
      const envConfig: EnvFileConfig = {
        source: './non-existent.json',
        target: 'env.json',
      };

      expect(() => copyEnvFile(envConfig, outDir)).not.toThrow();

      const targetPath = path.join(outDir, 'env.json');
      expect(fs.existsSync(targetPath)).toBe(false);
    });
  });

  describe('handleEnvFileBundle', () => {
    it('should emit file when env config is valid', () => {
      // Create a test env file
      const envPath = path.join(tempDir, 'env.json');
      fs.writeFileSync(envPath, JSON.stringify({ API_URL: 'test' }), 'utf8');

      const mockPlugin = {
        emitFile: vi.fn(),
      };

      handleEnvFileBundle(mockPlugin, {
        configJsonDir: tempDir,
        configJsonFileName: 'env.json',
      });

      expect(mockPlugin.emitFile).toHaveBeenCalledWith({
        type: 'asset',
        fileName: 'env.json',
        source: '{"API_URL":"test"}',
      });
    });

    it('should handle missing env file gracefully', () => {
      const mockPlugin = {
        emitFile: vi.fn(),
      };

      handleEnvFileBundle(mockPlugin, {
        configJsonDir: tempDir,
        configJsonFileName: 'non-existent.json',
      });

      expect(mockPlugin.emitFile).not.toHaveBeenCalled();
    });
  });
});
