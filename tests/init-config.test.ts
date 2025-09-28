import { describe, expect, it, vi } from 'vitest';
import { initConfig } from '../lib/browser/init-config';

describe('init-config', () => {
  it('should throw error when config not loaded', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const mockConfigEntry = vi.fn().mockReturnValue({ parsed: 'config' });

    await expect(initConfig(mockConfigEntry)).rejects.toThrow();
  });

  it('should load config successfully', async () => {
    // Mock successful fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ test: 'data' }),
    });

    const mockConfigEntry = vi.fn().mockReturnValue({ parsed: 'config' });

    const result = await initConfig(mockConfigEntry);
    expect(result).toEqual({ parsed: 'config' });
  });
});
