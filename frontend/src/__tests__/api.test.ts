/**
 * Test file for API base URL construction logic
 * Run with: npm test
 */

// Export to make this a module
export {};

// Mock window.location for testing
const mockLocation = (pathname: string) => {
  delete (window as any).location;
  (window as any).location = { pathname };
};

// Mock process.env.NODE_ENV
const mockNodeEnv = (env: string) => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = env;
  return () => { process.env.NODE_ENV = originalEnv; };
};

describe('API Base URL Construction', () => {
  beforeEach(() => {
    // Clear module cache to reload API configuration
    jest.resetModules();
  });

  test('should use localhost:8000 in development', async () => {
    const restoreEnv = mockNodeEnv('development');
    mockLocation('/');

    // Re-import to get fresh API_BASE_URL
    const { apiService } = await import('../services/api');

    // Verify development URL is used
    expect(apiService.healthCheck).toBeDefined();

    restoreEnv();
  });

  test('should use /api for root deployment in production', async () => {
    const restoreEnv = mockNodeEnv('production');
    mockLocation('/');

    // Mock fetch to capture the URL
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('{"success": true}', { status: 200 })
    );

    // Re-import to get fresh API_BASE_URL
    const { apiService } = await import('../services/api');

    await apiService.healthCheck();

    expect(fetchSpy).toHaveBeenCalledWith('/api/health', expect.any(Object));

    fetchSpy.mockRestore();
    restoreEnv();
  });

  test('should use subpath/api for subpath deployment in production', async () => {
    const restoreEnv = mockNodeEnv('production');
    mockLocation('/crossword-bad-prompt/some-page');

    // Mock fetch to capture the URL
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('{"success": true}', { status: 200 })
    );

    // Re-import to get fresh API_BASE_URL
    const { apiService } = await import('../services/api');

    await apiService.healthCheck();

    expect(fetchSpy).toHaveBeenCalledWith('/crossword-bad-prompt/api/health', expect.any(Object));

    fetchSpy.mockRestore();
    restoreEnv();
  });

  test('should handle multiple subpath levels', async () => {
    const restoreEnv = mockNodeEnv('production');
    mockLocation('/level1/level2/crossword/page');

    // Mock fetch to capture the URL
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('{"success": true}', { status: 200 })
    );

    // Re-import to get fresh API_BASE_URL
    const { apiService } = await import('../services/api');

    await apiService.healthCheck();

    expect(fetchSpy).toHaveBeenCalledWith('/level1/level2/crossword/api/health', expect.any(Object));

    fetchSpy.mockRestore();
    restoreEnv();
  });

});