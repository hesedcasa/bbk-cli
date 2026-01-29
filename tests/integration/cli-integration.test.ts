import fs from 'fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Bitbucket API functions - must be at top level but without external references
vi.mock('../../src/utils/bitbucket-client.js', () => ({
  listRepositories: vi.fn(),
  getRepository: vi.fn(),
  listPullRequests: vi.fn(),
  getPullRequest: vi.fn(),
  createPullRequest: vi.fn(),
  listBranches: vi.fn(),
  listCommits: vi.fn(),
  listIssues: vi.fn(),
  getIssue: vi.fn(),
  createIssue: vi.fn(),
  listPipelines: vi.fn(),
  getUser: vi.fn(),
  testConnection: vi.fn(),
  clearClients: vi.fn(),
}));

// Mock helper functions
vi.mock('../../src/commands/helpers.js', () => ({
  printAvailableCommands: vi.fn(),
  printCommandDetail: vi.fn(),
  getCurrentVersion: vi.fn(() => '0.0.0'),
}));

// Integration tests that test the entire flow through multiple modules

describe('CLI Integration', () => {
  let testConfigDir: string;
  let homedirSpy: vi.SpyInstance;
  let configPath: string;

  beforeEach(() => {
    testConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bbk-cli-integration-'));

    // Spy on os.homedir() to return test directory (works on all platforms)
    homedirSpy = vi.spyOn(os, 'homedir').mockReturnValue(testConfigDir);

    configPath = path.join(testConfigDir, '.bbkcli');

    // Write valid INI config
    const configContent = `[auth]
email=test@test.com
api_token=test_token_123

[defaults]
workspace=testworkspace
format=json
`;
    fs.writeFileSync(configPath, configContent);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    fs.rmSync(testConfigDir, { recursive: true, force: true });

    // Restore original os.homedir()
    homedirSpy.mockRestore();
  });

  describe('Config Loading Integration', () => {
    it('should load and parse configuration file', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader.js');
      const config = await loadConfig();

      expect(config).toBeDefined();
      expect(config.email).toBe('test@test.com');
      expect(config.apiToken).toBe('test_token_123');
      expect(config.defaultWorkspace).toBe('testworkspace');
      expect(config.defaultFormat).toBe('json');
    });

    it('should load config without optional fields', async () => {
      // Write minimal config
      const minimalConfig = `[auth]
email=minimal@test.com
api_token=minimal_token
`;
      fs.writeFileSync(configPath, minimalConfig);

      const { loadConfig } = await import('../../src/utils/config-loader.js');
      const config = await loadConfig();

      expect(config.email).toBe('minimal@test.com');
      expect(config.apiToken).toBe('minimal_token');
      expect(config.defaultWorkspace).toBeUndefined();
      expect(config.defaultFormat).toBe('json'); // Default format
    });
  });

  describe('Command Runner Integration', () => {
    it('should parse command line arguments and execute', async () => {
      const { parseArguments } = await import('../../src/utils/arg-parser.js');
      const { listRepositories } = await import('../../src/utils/bitbucket-client.js');

      // Mock the Bitbucket API call
      vi.mocked(listRepositories).mockResolvedValue({
        success: true,
        result: JSON.stringify({ repositories: [{ slug: 'my-repo', name: 'My Repository' }] }),
      });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await parseArguments(['list-repositories', '{"workspace":"test-workspace"}']);
      } catch {
        // Expected
      }

      expect(listRepositories).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('repositories'));
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should handle --version flag', async () => {
      const { parseArguments } = await import('../../src/utils/arg-parser.js');

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await parseArguments(['--version']);
      } catch {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith('0.0.0');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should handle --commands flag', async () => {
      const { parseArguments } = await import('../../src/utils/arg-parser.js');
      const { printAvailableCommands } = await import('../../src/commands/helpers.js');

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await parseArguments(['--commands']);
      } catch {
        // Expected
      }

      expect(printAvailableCommands).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });

    it('should handle command-specific help', async () => {
      const { parseArguments } = await import('../../src/utils/arg-parser.js');
      const { printCommandDetail } = await import('../../src/commands/helpers.js');

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await parseArguments(['list-repositories', '-h']);
      } catch {
        // Expected
      }

      expect(printCommandDetail).toHaveBeenCalledWith('list-repositories');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });
  });

  describe('CLI Wrapper Integration', () => {
    it('should initialize CLI with config', async () => {
      const { wrapper } = await import('../../src/cli/wrapper.js');

      const cli = new wrapper();

      await cli.connect();

      // Config should be loaded
      // @ts-expect-error - accessing private property for testing
      expect(cli.config).toBeDefined();
      // @ts-expect-error - accessing private property for testing
      expect(cli.config?.email).toBe('test@test.com');
    });

    it('should handle format switching', async () => {
      const { wrapper } = await import('../../src/cli/wrapper.js');
      const cli = new wrapper();

      await cli.connect();

      const handleCommand = cli['handleCommand'].bind(cli);
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await handleCommand('format toon');

      expect(consoleLogSpy).toHaveBeenCalledWith('Output format set to: toon');

      consoleLogSpy.mockRestore();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid email format', async () => {
      // Write config with invalid email
      const invalidConfig = `[auth]
email=invalid-email
api_token=test_token
`;
      fs.writeFileSync(configPath, invalidConfig);

      const { loadConfig } = await import('../../src/utils/index.js');

      expect(() => loadConfig()).toThrow('Invalid email format');
    });
  });

  describe('End-to-End Workflows', () => {
    it('should execute list-repositories workflow', async () => {
      const { runCommand } = await import('../../src/commands/runner.js');
      const { listRepositories } = await import('../../src/utils/bitbucket-client.js');

      vi.mocked(listRepositories).mockResolvedValue({
        success: true,
        result: JSON.stringify({
          repositories: [
            { slug: 'docs-repo', name: 'Documentation' },
            { slug: 'eng-repo', name: 'Engineering' },
          ],
        }),
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await runCommand('list-repositories', '{"workspace":"test-workspace"}', null);
      } catch {
        // Expected
      }

      expect(listRepositories).toHaveBeenCalledWith('test-workspace', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('docs-repo'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Engineering'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute create-issue workflow', async () => {
      const { runCommand } = await import('../../src/commands/runner.js');
      const { createIssue } = await import('../../src/utils/bitbucket-client.js');

      vi.mocked(createIssue).mockResolvedValue({
        success: true,
        result: JSON.stringify({
          id: '12345',
          title: 'New Issue',
          kind: 'bug',
        }),
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await runCommand(
          'create-issue',
          JSON.stringify({
            workspace: 'test-workspace',
            repoSlug: 'my-repo',
            title: 'New Issue',
            content: 'Issue description',
          }),
          null
        );
      } catch {
        // Expected
      }

      expect(createIssue).toHaveBeenCalledWith(
        'test-workspace',
        'my-repo',
        'New Issue',
        'Issue description',
        undefined,
        undefined,
        'json'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('12345'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute get-user workflow', async () => {
      const { runCommand } = await import('../../src/commands/runner.js');
      const { getUser } = await import('../../src/utils/bitbucket-client.js');

      vi.mocked(getUser).mockResolvedValue({
        success: true,
        result: JSON.stringify({
          uuid: '{5b10a2844c20165700ede21g}',
          display_name: 'John Doe',
          username: 'johndoe',
        }),
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await runCommand('get-user', '{"userId":"5b10a2844c20165700ede21g"}', null);
      } catch {
        // Expected
      }

      expect(getUser).toHaveBeenCalledWith('5b10a2844c20165700ede21g', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute test-connection workflow', async () => {
      const { runCommand } = await import('../../src/commands/runner.js');
      const { testConnection } = await import('../../src/utils/bitbucket-client.js');

      vi.mocked(testConnection).mockResolvedValue({
        success: true,
        result: 'Connection successful!\n\nLogged in as: John Doe (johndoe)',
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await runCommand('test-connection', null, null);
      } catch {
        // Expected
      }

      expect(testConnection).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Connection successful'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('Default Workspace Resolution', () => {
    it('should override default workspace when specified', async () => {
      const { runCommand } = await import('../../src/commands/runner.js');
      const { listRepositories } = await import('../../src/utils/bitbucket-client.js');

      vi.mocked(listRepositories).mockResolvedValue({
        success: true,
        result: JSON.stringify({ repositories: [] }),
      });

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await runCommand('list-repositories', '{"workspace":"custom-workspace"}', null);
      } catch {
        // Expected
      }

      // Should use the specified workspace, not the default
      expect(listRepositories).toHaveBeenCalledWith('custom-workspace', 'json');

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });
});
