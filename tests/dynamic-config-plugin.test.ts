import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dynamicConfig } from '../lib/vite/dynamic-config-plugin';

// Mock dependencies
vi.mock('../lib/vite/config-generator', () => ({
  generateConfigFile: vi.fn(),
}));

vi.mock('../lib/vite/config-scanner', () => ({
  fileContainsCreateConfig: vi.fn(),
}));

vi.mock('../lib/vite/env-file-handler', () => ({
  normalizeEnvFileConfig: vi.fn(() => null),
  addEnvFileToAssets: vi.fn(),
}));

describe('dynamicConfig plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a plugin with correct name', () => {
    const plugin = dynamicConfig();
    expect(plugin.name).toBe('dynamic-config');
  });

  it('should have required hooks', () => {
    const plugin = dynamicConfig();

    expect(plugin.buildStart).toBeDefined();
    expect(plugin.generateBundle).toBeDefined();
    expect(plugin.configureServer).toBeDefined();
  });

  it('should handle empty options', () => {
    expect(() => dynamicConfig()).not.toThrow();
    expect(() => dynamicConfig({})).not.toThrow();
  });

  it('should handle options with all properties', () => {
    const options = {
      definitionDirs: ['src', 'components'],
      configJsonFileName: 'custom-env.json',
    };

    expect(() => dynamicConfig(options)).not.toThrow();
  });
});
