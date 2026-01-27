import fs from 'fs';
import os from 'os';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the Bitbucket API functions
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

// Mock helper functions - only where we need to spy on them
vi.mock('../../src/commands/helpers.js', async () => {
  const actual = await vi.importActual('../../src/commands/helpers.js');
  return {
    ...actual,
    printAvailableCommands: vi.fn(actual.printAvailableCommands),
    printCommandDetail: vi.fn(actual.printCommandDetail),
    getCurrentVersion: vi.fn(() => '0.0.0'),
  };
});

// Mock config-loader to spy on loadConfig
vi.mock('../../src/utils/config-loader.js', async () => {
  const actual = await vi.importActual('../../src/utils/config-loader.js');
  return {
    ...actual,
    loadConfig: vi.fn(actual.loadConfig),
  };
});

// Integration tests that test the entire flow through multiple modules

describe('CLI Integration', () => {
  let testDir: string;
  let configPath: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bbk-cli-integration-'));
    fs.mkdirSync(path.join(testDir, '.claude'));
    configPath = path.join(testDir, '.claude', 'bitbucket-config.local.md');

    // Write valid config
    const configContent = `---
profiles:
  cloud:
    email: test@test.com
    apiToken: test_token_123
  staging:
    email: staging@test.com
    apiToken: staging_token_456

defaultProfile: cloud
defaultFormat: json
---

# Test Config`;
    fs.writeFileSync(configPath, configContent);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('Config Loading Integration', () => {
    it('should load and parse configuration file', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { loadConfig } = await import('../../src/utils/config-loader.js');
      const config = await loadConfig(testDir);

      expect(config).toBeDefined();
      expect(config.profiles).toBeDefined();
      expect(config.profiles.cloud).toBeDefined();
      expect(config.profiles.cloud.email).toBe('test@test.com');
      expect(config.profiles.cloud.apiToken).toBe('test_token_123');
      expect(config.defaultProfile).toBe('cloud');
      expect(config.defaultFormat).toBe('json');
    });

    it('should support multiple profiles', async () => {
      const { loadConfig } = await import('../../src/utils/config-loader.js');
      const config = await loadConfig(testDir);

      expect(Object.keys(config.profiles)).toHaveLength(2);
      expect(config.profiles.cloud).toBeDefined();
      expect(config.profiles.staging).toBeDefined();
    });

    it('should validate required profile fields', async () => {
      const invalidConfig = `---
profiles:
  incomplete:
    email: test@test.com
    # Missing apiToken
---
`;
      fs.writeFileSync(configPath, invalidConfig);

      const { loadConfig } = await import('../../src/utils/config-loader.js');

      expect(() => loadConfig(testDir)).toThrow('must have both "email" and "apiToken"');
    });
  });

  describe('Command Runner Integration', () => {
    it('should parse command line arguments and execute', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { parseArguments } = await import('../../src/utils/arg-parser.js');
      const { listRepositories } = await import('../../src/utils/bitbucket-client.js');

      // Mock the Bitbucket API call
      listRepositories.mockResolvedValue({
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

  describe('Bitbucket API Integration', () => {
    it('should initialize Bitbucket client with profile', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { getBitbucketClientOptions } = await import('../../src/utils/config-loader.js');
      const { loadConfig } = await import('../../src/utils/config-loader.js');

      const config = await loadConfig(testDir);
      const options = getBitbucketClientOptions(config, 'cloud');

      expect(options.auth).toBeDefined();
      expect(options.auth?.email).toBe('test@test.com');
      expect(options.auth?.apiToken).toBe('test_token_123');
    });

    it('should handle different profiles', async () => {
      const { getBitbucketClientOptions } = await import('../../src/utils/config-loader.js');
      const { loadConfig } = await import('../../src/utils/config-loader.js');

      const config = await loadConfig(testDir);
      const cloudOptions = getBitbucketClientOptions(config, 'cloud');
      const stagingOptions = getBitbucketClientOptions(config, 'staging');

      expect(cloudOptions.auth?.email).toBe('test@test.com');
      expect(stagingOptions.auth?.email).toBe('staging@test.com');
      expect(cloudOptions).not.toEqual(stagingOptions);
    });
  });

  describe('Command Help Integration', () => {
    it('should display all available commands', async () => {
      const { printAvailableCommands } = await import('../../src/commands/helpers.js');
      const { COMMANDS } = await import('../../src/config/constants.js');

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printAvailableCommands();

      expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable commands:');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(`1. ${COMMANDS[0]}`));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(`10. ${COMMANDS[9]}`));

      consoleLogSpy.mockRestore();
    });

    it('should display detailed help for each command', async () => {
      const { printCommandDetail } = await import('../../src/commands/helpers.js');
      const { COMMANDS, COMMANDS_INFO } = await import('../../src/config/constants.js');

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      COMMANDS.forEach((command, index) => {
        consoleLogSpy.mockClear();
        printCommandDetail(command);

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(command));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(COMMANDS_INFO[index]));
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('CLI Wrapper Integration', () => {
    it('should initialize CLI with config', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { wrapper } = await import('../../src/cli/wrapper.js');
      const { loadConfig } = await import('../../src/utils/config-loader.js');

      const cli = new wrapper();

      await cli.connect();

      expect(loadConfig).toHaveBeenCalledWith(testDir);
    });

    it('should handle profile switching', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { wrapper } = await import('../../src/cli/wrapper.js');
      const cli = new wrapper();

      await cli.connect();

      // Simulate profile switch
      const handleCommand = cli['handleCommand'].bind(cli);
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await handleCommand('profile staging');

      expect(consoleLogSpy).toHaveBeenCalledWith('Switched to profile: staging');

      consoleLogSpy.mockRestore();
    });

    it('should handle format switching', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

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
    it('should handle missing config file', async () => {
      fs.rmSync(configPath);

      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { loadConfig } = await import('../../src/utils/config-loader.js');

      expect(() => loadConfig(testDir)).toThrow('Configuration file not found');
    });

    it('should handle invalid config format', async () => {
      const invalidConfig = `# Invalid Config

This is just markdown without frontmatter
`;
      fs.writeFileSync(configPath, invalidConfig);

      const { loadConfig } = await import('../../src/utils/config-loader.js');

      expect(() => loadConfig(testDir)).toThrow('Invalid configuration file format');
    });

    it('should handle missing profile', async () => {
      const { getBitbucketClientOptions } = await import('../../src/utils/config-loader.js');
      const { loadConfig } = await import('../../src/utils/config-loader.js');

      const config = await loadConfig(testDir);

      expect(() => getBitbucketClientOptions(config, 'nonexistent')).toThrow('Profile "nonexistent" not found');
    });

    it('should handle invalid email format', async () => {
      const invalidConfig = `---
profiles:
  invalid:
    email: invalid-email
    apiToken: token
---
`;
      fs.writeFileSync(configPath, invalidConfig);

      const { loadConfig } = await import('../../src/utils/config-loader.js');

      expect(() => loadConfig(testDir)).toThrow('Profile "invalid" has invalid email format: "invalid-email"');
    });
  });

  describe('End-to-End Workflows', () => {
    it('should execute list-repositories workflow', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { runCommand } = await import('../../src/commands/runner.js');
      const { listRepositories } = await import('../../src/utils/bitbucket-client.js');

      listRepositories.mockResolvedValue({
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

      expect(listRepositories).toHaveBeenCalledWith('cloud', 'test-workspace', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('docs-repo'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Engineering'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute create-issue workflow', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { runCommand } = await import('../../src/commands/runner.js');
      const { createIssue } = await import('../../src/utils/bitbucket-client.js');

      createIssue.mockResolvedValue({
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
        'cloud',
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
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { runCommand } = await import('../../src/commands/runner.js');
      const { getUser } = await import('../../src/utils/bitbucket-client.js');

      getUser.mockResolvedValue({
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

      expect(getUser).toHaveBeenCalledWith('cloud', '5b10a2844c20165700ede21g', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute test-connection workflow', async () => {
      process.env.CLAUDE_PROJECT_ROOT = testDir;

      const { runCommand } = await import('../../src/commands/runner.js');
      const { testConnection } = await import('../../src/utils/bitbucket-client.js');

      testConnection.mockResolvedValue({
        success: true,
        result: 'Connection successful!\n\nProfile: cloud\nLogged in as: John Doe (johndoe)',
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

      expect(testConnection).toHaveBeenCalledWith('cloud');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Connection successful'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });
});
