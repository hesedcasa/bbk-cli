import { beforeEach, describe, expect, it, vi } from 'vitest';

import { wrapper } from '../../../src/cli/wrapper.js';

// Create shared mock interface for readline
const mockRlInterface = {
  prompt: vi.fn(),
  on: vi.fn(),
  close: vi.fn(),
};

// Mock readline
vi.mock('readline', () => ({
  default: {
    createInterface: vi.fn(() => mockRlInterface),
  },
  createInterface: vi.fn(() => mockRlInterface),
}));

// Mock the commands module
vi.mock('../../../src/commands/index.js', () => ({
  getCurrentVersion: vi.fn().mockReturnValue('0.0.0'),
  printAvailableCommands: vi.fn(),
  printCommandDetail: vi.fn(),
}));

// Mock the config module
vi.mock('../../../src/config/index.js', () => ({
  COMMANDS: [
    'list-repositories',
    'get-repository',
    'list-pullrequests',
    'get-pullrequest',
    'create-pullrequest',
    'list-branches',
    'list-commits',
    'list-issues',
    'get-issue',
    'create-issue',
    'list-pipelines',
    'get-user',
    'test-connection',
  ],
}));

// Mock the utils module
vi.mock('../../../src/utils/index.js', () => ({
  clearClients: vi.fn(),
  createIssue: vi.fn(),
  createPullRequest: vi.fn(),
  getIssue: vi.fn(),
  getPullRequest: vi.fn(),
  getRepository: vi.fn(),
  getUser: vi.fn(),
  listBranches: vi.fn(),
  listCommits: vi.fn(),
  listIssues: vi.fn(),
  listPipelines: vi.fn(),
  listPullRequests: vi.fn(),
  listRepositories: vi.fn(),
  loadConfig: vi.fn(),
  testConnection: vi.fn(),
}));

const originalEnv = process.env;

describe('cli/wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    // Reset the mock readline interface
    mockRlInterface.prompt.mockClear();
    mockRlInterface.on.mockClear();
    mockRlInterface.close.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('wrapper', () => {
    let cli: wrapper;

    beforeEach(() => {
      cli = new wrapper();
    });

    describe('constructor', () => {
      it('should create readline interface with correct prompt', async () => {
        const readline = await import('readline');

        const newCli = new wrapper();

        expect(readline.default.createInterface).toHaveBeenCalledWith({
          input: process.stdin,
          output: process.stdout,
          prompt: 'bbk> ',
        });
        expect(newCli).toBeDefined();
      });
    });

    describe('connect', () => {
      it('should load config successfully', async () => {
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { email: 'test@test.com', apiToken: 'token123' } },
          defaultProfile: 'cloud',
          defaultFormat: 'json',
        });

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli.connect();

        expect(loadConfig).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Bitbucket CLI'));

        consoleLogSpy.mockRestore();
      });

      it('should set default profile and format', async () => {
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { email: 'test@test.com', apiToken: 'token123' } },
          defaultProfile: 'cloud',
          defaultFormat: 'toon',
        });

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli.connect();

        // @ts-expect-error - accessing private property for testing
        expect(cli.currentProfile).toBe('cloud');
        // @ts-expect-error - accessing private property for testing
        expect(cli.currentFormat).toBe('toon');

        consoleLogSpy.mockRestore();
      });

      it('should exit with error if config load fails', async () => {
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockImplementation(() => {
          throw new Error('Config file not found');
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
          throw new Error('process.exit called');
        });

        try {
          await cli.connect();
        } catch {
          // Expected
        }

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load configuration:', 'Config file not found');
        expect(consoleErrorSpy).toHaveBeenCalledWith('\nMake sure:');
        expect(consoleErrorSpy).toHaveBeenCalledWith('1. .claude/bitbucket-config.local.md exists');
        expect(exitSpy).toHaveBeenCalledWith(1);

        consoleErrorSpy.mockRestore();
        exitSpy.mockRestore();
      });

      it('should use CLAUDE_PROJECT_ROOT if set', async () => {
        process.env.CLAUDE_PROJECT_ROOT = '/custom/root';
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { email: 'test@test.com', apiToken: 'token123' } },
          defaultProfile: 'cloud',
          defaultFormat: 'json',
        });

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli.connect();

        expect(loadConfig).toHaveBeenCalledWith('/custom/root');

        consoleLogSpy.mockRestore();
      });

      it('should use process.cwd() if CLAUDE_PROJECT_ROOT not set', async () => {
        delete process.env.CLAUDE_PROJECT_ROOT;
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { email: 'test@test.com', apiToken: 'token123' } },
          defaultProfile: 'cloud',
          defaultFormat: 'json',
        });

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli.connect();

        expect(loadConfig).toHaveBeenCalledWith(process.cwd());

        consoleLogSpy.mockRestore();
      });
    });

    describe('handleCommand', () => {
      beforeEach(async () => {
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { host: 'https://test.atlassian.net', email: 'test@test.com', apiToken: 'token' } },
          defaultProfile: 'cloud',
          defaultFormat: 'json',
        });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        await cli.connect();
        consoleLogSpy.mockRestore();
      });

      it('should handle empty input', async () => {
        await cli['handleCommand']('   ');

        expect(mockRlInterface.prompt).toHaveBeenCalled();
      });

      it('should handle exit command', async () => {
        const { clearClients } = await import('../../../src/utils/index.js');
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('exit');

        expect(mockRlInterface.close).toHaveBeenCalled();
        expect(clearClients).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });

      it('should handle quit command', async () => {
        const { clearClients } = await import('../../../src/utils/index.js');
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('quit');

        expect(mockRlInterface.close).toHaveBeenCalled();
        expect(clearClients).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });

      it('should handle q command', async () => {
        const { clearClients } = await import('../../../src/utils/index.js');
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('q');

        expect(mockRlInterface.close).toHaveBeenCalled();
        expect(clearClients).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });

      it('should handle help command', async () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('help');

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Bitbucket CLI'));
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });

      it('should handle ? command as help', async () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('?');

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Bitbucket CLI'));
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });

      it('should handle commands command', async () => {
        const { printAvailableCommands } = await import('../../../src/commands/index.js');

        await cli['handleCommand']('commands');

        expect(printAvailableCommands).toHaveBeenCalled();
        expect(mockRlInterface.prompt).toHaveBeenCalled();
      });

      it('should handle clear command', async () => {
        const consoleSpy = vi.spyOn(console, 'clear').mockImplementation(() => {});

        await cli['handleCommand']('clear');

        expect(consoleSpy).toHaveBeenCalled();
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });

      it('should switch profile to valid profile', async () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('profile cloud');

        expect(consoleLogSpy).toHaveBeenCalledWith('Switched to profile: cloud');
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });

      it('should show error for invalid profile', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['handleCommand']('profile nonexistent');

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('ERROR:'));
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should switch format to valid format', async () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('format toon');

        expect(consoleLogSpy).toHaveBeenCalledWith('Output format set to: toon');
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });

      it('should show error for invalid format', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['handleCommand']('format xml');

        expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: Invalid format. Choose: json or toon');
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should list available profiles', async () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('profiles');

        expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable profiles:');
        expect(consoleLogSpy).toHaveBeenCalledWith('1. cloud (current)');
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });

      it('should show command detail with -h flag', async () => {
        const { printCommandDetail } = await import('../../../src/commands/index.js');

        await cli['handleCommand']('list-repositories -h');

        expect(printCommandDetail).toHaveBeenCalledWith('list-repositories');
        expect(mockRlInterface.prompt).toHaveBeenCalled();
      });

      it('should show error for unknown command', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['handleCommand']('unknown-command');

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command:'));
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should trim whitespace from command', async () => {
        const { listRepositories } = await import('../../../src/utils/index.js');
        vi.mocked(listRepositories).mockResolvedValue({ success: true, result: '{}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['handleCommand']('  list-repositories  {"workspace":"myworkspace"}  ');

        expect(listRepositories).toHaveBeenCalled();
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });
    });

    describe('runCommand', () => {
      beforeEach(async () => {
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { email: 'test@test.com', apiToken: 'token123' } },
          defaultProfile: 'cloud',
          defaultFormat: 'json',
        });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        await cli.connect();
        consoleLogSpy.mockRestore();
      });

      it('should execute list-repositories command', async () => {
        const { listRepositories } = await import('../../../src/utils/index.js');
        vi.mocked(listRepositories).mockResolvedValue({ success: true, result: '{"repositories": []}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('list-repositories', '{"workspace":"myworkspace"}');

        expect(listRepositories).toHaveBeenCalledWith('cloud', 'myworkspace', 'json');

        consoleLogSpy.mockRestore();
      });

      it('should execute get-repository with workspace and repoSlug', async () => {
        const { getRepository } = await import('../../../src/utils/index.js');
        vi.mocked(getRepository).mockResolvedValue({ success: true, result: '{"name":"my-repo"}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('get-repository', '{"workspace":"myworkspace","repoSlug":"my-repo"}');

        expect(getRepository).toHaveBeenCalledWith('cloud', 'myworkspace', 'my-repo', 'json');

        consoleLogSpy.mockRestore();
      });

      it('should show error if get-repository missing parameters', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['runCommand']('get-repository', '{}');

        expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: "workspace" and "repoSlug" parameters are required');
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should execute list-pullrequests with all parameters', async () => {
        const { listPullRequests } = await import('../../../src/utils/index.js');
        vi.mocked(listPullRequests).mockResolvedValue({ success: true, result: '{"pullrequests": []}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('list-pullrequests', '{"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}');

        expect(listPullRequests).toHaveBeenCalledWith('cloud', 'myworkspace', 'my-repo', 'OPEN', 'json');

        consoleLogSpy.mockRestore();
      });

      it('should execute get-issue with parameters', async () => {
        const { getIssue } = await import('../../../src/utils/index.js');
        vi.mocked(getIssue).mockResolvedValue({ success: true, result: '{"id":"123"}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('get-issue', '{"workspace":"myworkspace","repoSlug":"my-repo","issueId":"123"}');

        expect(getIssue).toHaveBeenCalledWith('cloud', 'myworkspace', 'my-repo', '123', 'json');

        consoleLogSpy.mockRestore();
      });

      it('should show error if get-issue missing parameters', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['runCommand']('get-issue', '{}');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'ERROR: "workspace", "repoSlug", and "issueId" parameters are required'
        );
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should execute create-issue with required parameters', async () => {
        const { createIssue } = await import('../../../src/utils/index.js');
        vi.mocked(createIssue).mockResolvedValue({ success: true, result: '{"id":"456"}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand'](
          'create-issue',
          '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug report"}'
        );

        expect(createIssue).toHaveBeenCalledWith(
          'cloud',
          'myworkspace',
          'my-repo',
          'Bug report',
          undefined,
          undefined,
          undefined,
          'json'
        );

        consoleLogSpy.mockRestore();
      });

      it('should show error if create-issue missing parameters', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['runCommand']('create-issue', '{"workspace":"myworkspace"}');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'ERROR: "workspace", "repoSlug", and "title" parameters are required'
        );
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should execute list-branches with parameters', async () => {
        const { listBranches } = await import('../../../src/utils/index.js');
        vi.mocked(listBranches).mockResolvedValue({ success: true, result: '{"branches": []}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('list-branches', '{"workspace":"myworkspace","repoSlug":"my-repo"}');

        expect(listBranches).toHaveBeenCalledWith('cloud', 'myworkspace', 'my-repo', undefined, undefined, 'json');

        consoleLogSpy.mockRestore();
      });

      it('should show error if list-branches missing parameters', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['runCommand']('list-branches', '{}');

        expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: "workspace" and "repoSlug" parameters are required');
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('should execute test-connection', async () => {
        const { testConnection } = await import('../../../src/utils/index.js');
        vi.mocked(testConnection).mockResolvedValue({ success: true, result: 'Connected' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('test-connection', '{}');

        expect(testConnection).toHaveBeenCalledWith('cloud');

        consoleLogSpy.mockRestore();
      });

      it('should execute get-user', async () => {
        const { getUser } = await import('../../../src/utils/index.js');
        vi.mocked(getUser).mockResolvedValue({ success: true, result: '{"username":"testuser"}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('get-user', '{"username":"testuser"}');

        expect(getUser).toHaveBeenCalledWith('cloud', 'testuser', 'json');

        consoleLogSpy.mockRestore();
      });

      it('should use profile from args if provided', async () => {
        const { listRepositories } = await import('../../../src/utils/index.js');
        vi.mocked(listRepositories).mockResolvedValue({ success: true, result: '{}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('list-repositories', '{"workspace":"myworkspace","profile":"staging"}');

        expect(listRepositories).toHaveBeenCalledWith('staging', 'myworkspace', 'json');

        consoleLogSpy.mockRestore();
      });

      it('should use format from args if provided', async () => {
        const { listRepositories } = await import('../../../src/utils/index.js');
        vi.mocked(listRepositories).mockResolvedValue({ success: true, result: '{}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('list-repositories', '{"workspace":"myworkspace","format":"toon"}');

        expect(listRepositories).toHaveBeenCalledWith('cloud', 'myworkspace', 'toon');

        consoleLogSpy.mockRestore();
      });

      it('should use current profile and format by default', async () => {
        const { listRepositories } = await import('../../../src/utils/index.js');
        vi.mocked(listRepositories).mockResolvedValue({ success: true, result: '{}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('list-repositories', '{"workspace":"myworkspace"}');

        expect(listRepositories).toHaveBeenCalledWith('cloud', 'myworkspace', 'json');

        consoleLogSpy.mockRestore();
      });

      it('should display success result', async () => {
        const { listRepositories } = await import('../../../src/utils/index.js');
        vi.mocked(listRepositories).mockResolvedValue({ success: true, result: '{"repositories": []}' });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['runCommand']('list-repositories', '{"workspace":"myworkspace"}');

        expect(consoleLogSpy).toHaveBeenCalledWith('\n{"repositories": []}');

        consoleLogSpy.mockRestore();
      });

      it('should display error result', async () => {
        const { listRepositories } = await import('../../../src/utils/index.js');
        vi.mocked(listRepositories).mockResolvedValue({ success: false, error: 'API Error' });
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['runCommand']('list-repositories', '{"workspace":"myworkspace"}');

        expect(consoleErrorSpy).toHaveBeenCalledWith('\nAPI Error');

        consoleErrorSpy.mockRestore();
      });

      it('should handle command errors', async () => {
        const { listRepositories } = await import('../../../src/utils/index.js');
        vi.mocked(listRepositories).mockRejectedValue(new Error('Network error'));
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await cli['runCommand']('list-repositories', '{"workspace":"myworkspace"}');

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error running command:', 'Network error');

        consoleErrorSpy.mockRestore();
      });

      it('should show error if configuration not loaded', async () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        // @ts-expect-error - accessing private property for testing
        cli.config = null;

        await cli['runCommand']('list-repositories', '{"workspace":"myworkspace"}');

        expect(consoleLogSpy).toHaveBeenCalledWith('Configuration not loaded!');
        expect(mockRlInterface.prompt).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });
    });

    describe('printHelp', () => {
      beforeEach(async () => {
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { email: 'test@test.com', apiToken: 'token123' } },
          defaultProfile: 'cloud',
          defaultFormat: 'json',
        });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        await cli.connect();
        consoleLogSpy.mockRestore();
      });

      it('should print help message with current settings', () => {
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        cli['printHelp']();

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Bitbucket CLI v0.0.0'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Profile: cloud'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Format:  json'));

        consoleLogSpy.mockRestore();
      });
    });

    describe('start', () => {
      beforeEach(async () => {
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { email: 'test@test.com', apiToken: 'token123' } },
          defaultProfile: 'cloud',
          defaultFormat: 'json',
        });
      });

      it('should setup readline event handlers', async () => {
        await cli.start();

        expect(mockRlInterface.prompt).toHaveBeenCalled();
        expect(mockRlInterface.on).toHaveBeenCalledWith('line', expect.any(Function));
        expect(mockRlInterface.on).toHaveBeenCalledWith('close', expect.any(Function));
      });

      it('should setup signal handlers for SIGINT and SIGTERM', async () => {
        const onSpy = vi.spyOn(process, 'on').mockImplementation(() => process);

        await cli.start();

        expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
        expect(onSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));

        onSpy.mockRestore();
      });
    });

    describe('disconnect', () => {
      beforeEach(async () => {
        const { loadConfig } = await import('../../../src/utils/index.js');
        vi.mocked(loadConfig).mockReturnValue({
          profiles: { cloud: { email: 'test@test.com', apiToken: 'token123' } },
          defaultProfile: 'cloud',
          defaultFormat: 'json',
        });
      });

      it('should clear clients and close readline', async () => {
        const { clearClients } = await import('../../../src/utils/index.js');
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await cli['disconnect']();

        expect(consoleLogSpy).toHaveBeenCalledWith('\nClosing Bitbucket connections...');
        expect(clearClients).toHaveBeenCalled();
        expect(mockRlInterface.close).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
      });
    });
  });
});
