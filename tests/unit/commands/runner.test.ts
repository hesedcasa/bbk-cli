import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runCommand } from '../../../src/commands/runner.js';

// Mock the utils module
vi.mock('../../../src/utils/index.js', () => ({
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
  loadConfig: vi.fn(),
  clearClients: vi.fn(),
  setupConfig: vi.fn(),
}));

// Mock process.env
const originalEnv = process.env;

describe('commands/runner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const mockConfig = {
    email: 'user@example.com',
    apiToken: 'test_token',
    defaultWorkspace: 'myworkspace',
    defaultFormat: 'json' as const,
  };

  describe('runCommand', () => {
    it('should execute list-repositories command', async () => {
      const { listRepositories, loadConfig, clearClients } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listRepositories.mockResolvedValue({ success: true, result: '{"repositories": []}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('list-repositories', '{"workspace":"myworkspace"}', null);

      expect(loadConfig).toHaveBeenCalled();
      expect(listRepositories).toHaveBeenCalledWith('myworkspace', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"repositories": []}');
      expect(clearClients).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should execute list-repositories with custom format', async () => {
      const { listRepositories, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listRepositories.mockResolvedValue({ success: true, result: '{"repositories": []}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('list-repositories', '{"workspace":"myworkspace","format":"toon"}', null);

      expect(listRepositories).toHaveBeenCalledWith('myworkspace', 'toon');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"repositories": []}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute get-repository command with workspace and repoSlug', async () => {
      const { getRepository, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      getRepository.mockResolvedValue({ success: true, result: '{"name":"my-repo"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('get-repository', '{"workspace":"myworkspace","repoSlug":"my-repo"}', null);

      expect(getRepository).toHaveBeenCalledWith('myworkspace', 'my-repo', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"name":"my-repo"}');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should exit with error if get-repository missing parameters', async () => {
      const { loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('get-repository', '{}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: "repoSlug" parameter is required');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should execute list-pullrequests command with all parameters', async () => {
      const { listPullRequests, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listPullRequests.mockResolvedValue({ success: true, result: '{"pullrequests": []}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('list-pullrequests', '{"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}', null);

      expect(listPullRequests).toHaveBeenCalledWith('myworkspace', 'my-repo', 'OPEN', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"pullrequests": []}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute list-pullrequests with minimal parameters', async () => {
      const { listPullRequests, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listPullRequests.mockResolvedValue({ success: true, result: '{"pullrequests": []}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('list-pullrequests', '{"workspace":"myworkspace","repoSlug":"my-repo"}', null);

      expect(listPullRequests).toHaveBeenCalledWith('myworkspace', 'my-repo', undefined, 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"pullrequests": []}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute get-pullrequest command', async () => {
      const { getPullRequest, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      getPullRequest.mockResolvedValue({ success: true, result: '{"id":"123","title":"Test PR"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand(
        'get-pullrequest',
        '{"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":"123"}',
        null
      );

      expect(getPullRequest).toHaveBeenCalledWith('myworkspace', 'my-repo', '123', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"id":"123","title":"Test PR"}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should exit with error if get-pullrequest missing parameters', async () => {
      const { loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('get-pullrequest', '{}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: "repoSlug" and "pullRequestId" parameters are required');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should execute create-pullrequest command', async () => {
      const { createPullRequest, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      createPullRequest.mockResolvedValue({ success: true, result: '{"id":"456","title":"New PR"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand(
        'create-pullrequest',
        '{"workspace":"myworkspace","repoSlug":"my-repo","title":"New PR","sourceBranch":"feature","destinationBranch":"main"}',
        null
      );

      expect(createPullRequest).toHaveBeenCalledWith(
        'myworkspace',
        'my-repo',
        'New PR',
        'feature',
        'main',
        undefined,
        'json'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('{"id":"456","title":"New PR"}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute create-pullrequest with description', async () => {
      const { createPullRequest, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      createPullRequest.mockResolvedValue({ success: true, result: '{"id":"456","title":"New PR"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand(
        'create-pullrequest',
        '{"workspace":"myworkspace","repoSlug":"my-repo","title":"New PR","sourceBranch":"feature","destinationBranch":"main","description":"Test description"}',
        null
      );

      expect(createPullRequest).toHaveBeenCalledWith(
        'myworkspace',
        'my-repo',
        'New PR',
        'feature',
        'main',
        'Test description',
        'json'
      );
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should exit with error if create-pullrequest missing required parameters', async () => {
      const { loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('create-pullrequest', '{"workspace":"myworkspace"}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ERROR: "repoSlug", "title", "sourceBranch", and "destinationBranch" parameters are required'
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should execute list-branches command', async () => {
      const { listBranches, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listBranches.mockResolvedValue({ success: true, result: '{"branches": []}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('list-branches', '{"workspace":"myworkspace","repoSlug":"my-repo"}', null);

      expect(listBranches).toHaveBeenCalledWith('myworkspace', 'my-repo', undefined, undefined, 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"branches": []}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute list-commits command', async () => {
      const { listCommits, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listCommits.mockResolvedValue({ success: true, result: '{"commits": []}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('list-commits', '{"workspace":"myworkspace","repoSlug":"my-repo"}', null);

      expect(listCommits).toHaveBeenCalledWith('myworkspace', 'my-repo', undefined, 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"commits": []}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute list-issues command', async () => {
      const { listIssues, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listIssues.mockResolvedValue({ success: true, result: '{"issues": []}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('list-issues', '{"workspace":"myworkspace","repoSlug":"my-repo"}', null);

      expect(listIssues).toHaveBeenCalledWith('myworkspace', 'my-repo', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"issues": []}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute get-issue command', async () => {
      const { getIssue, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      getIssue.mockResolvedValue({ success: true, result: '{"id":"123","title":"Test Issue"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('get-issue', '{"workspace":"myworkspace","repoSlug":"my-repo","issueId":"123"}', null);

      expect(getIssue).toHaveBeenCalledWith('myworkspace', 'my-repo', '123', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"id":"123","title":"Test Issue"}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should exit with error if get-issue missing parameters', async () => {
      const { loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('get-issue', '{}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: "repoSlug" and "issueId" parameters are required');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should execute create-issue command', async () => {
      const { createIssue, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      createIssue.mockResolvedValue({ success: true, result: '{"id":"456","title":"New Issue"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('create-issue', '{"workspace":"myworkspace","repoSlug":"my-repo","title":"New Issue"}', null);

      expect(createIssue).toHaveBeenCalledWith(
        'myworkspace',
        'my-repo',
        'New Issue',
        undefined,
        undefined,
        undefined,
        'json'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('{"id":"456","title":"New Issue"}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute create-issue with optional parameters', async () => {
      const { createIssue, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      createIssue.mockResolvedValue({ success: true, result: '{"id":"789"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

      await runCommand(
        'create-issue',
        '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug report","content":"Details here","kind":"bug","priority":"major"}',
        null
      );

      expect(createIssue).toHaveBeenCalledWith(
        'myworkspace',
        'my-repo',
        'Bug report',
        'Details here',
        'bug',
        'major',
        'json'
      );
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });

    it('should exit with error if create-issue missing required parameters', async () => {
      const { loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('create-issue', '{"workspace":"myworkspace"}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: "repoSlug" and "title" parameters are required');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should execute list-pipelines command', async () => {
      const { listPipelines, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listPipelines.mockResolvedValue({ success: true, result: '{"pipelines": []}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('list-pipelines', '{"workspace":"myworkspace","repoSlug":"my-repo"}', null);

      expect(listPipelines).toHaveBeenCalledWith('myworkspace', 'my-repo', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"pipelines": []}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute get-user with userId', async () => {
      const { getUser, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      getUser.mockResolvedValue({ success: true, result: '{"displayName":"User"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('get-user', '{"userId":"5b10a2844c20165700ede21g"}', null);

      expect(getUser).toHaveBeenCalledWith('5b10a2844c20165700ede21g', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"displayName":"User"}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute get-user without parameters (current user)', async () => {
      const { getUser, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      getUser.mockResolvedValue({ success: true, result: '{"displayName":"Current User"}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('get-user', null, null);

      expect(getUser).toHaveBeenCalledWith(undefined, 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('{"displayName":"Current User"}');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute test-connection command', async () => {
      const { testConnection, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      testConnection.mockResolvedValue({ success: true, result: 'Connected successfully' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('test-connection', null, null);

      expect(testConnection).toHaveBeenCalledWith();
      expect(consoleLogSpy).toHaveBeenCalledWith('Connected successfully');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should handle command failure', async () => {
      const { getRepository, loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      getRepository.mockResolvedValue({ success: false, error: 'Repository not found' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('get-repository', '{"workspace":"myworkspace","repoSlug":"invalid"}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Repository not found');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle unknown command', async () => {
      const { loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('unknown-command', '{}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown command: unknown-command');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle JSON parse error in arguments', async () => {
      const { loadConfig, clearClients } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('list-repositories', 'invalid json', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error executing command:',
        expect.stringContaining('not valid JSON')
      );
      expect(clearClients).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should clear clients on successful execution', async () => {
      const { listRepositories, loadConfig, clearClients } = await import('../../../src/utils/index.js');
      loadConfig.mockReturnValue(mockConfig);
      listRepositories.mockResolvedValue({ success: true, result: '{}' });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('list-repositories', '{"workspace":"myworkspace"}', null);

      expect(clearClients).toHaveBeenCalled();

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should clear clients on error', async () => {
      const { loadConfig, clearClients } = await import('../../../src/utils/index.js');
      loadConfig.mockImplementation(() => {
        throw new Error('Config error');
      });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('list-repositories', '{"workspace":"myworkspace"}', null);

      expect(clearClients).toHaveBeenCalled();

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle exceptions and display error message', async () => {
      const { loadConfig } = await import('../../../src/utils/index.js');
      loadConfig.mockImplementation(() => {
        throw new Error('Configuration load failed');
      });

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await runCommand('list-repositories', '{"workspace":"myworkspace"}', null);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error executing command:', 'Configuration load failed');
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle config command and call setupConfig', async () => {
      const { setupConfig, clearClients } = await import('../../../src/utils/index.js');
      setupConfig.mockResolvedValue(undefined);

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await runCommand('config', null, null);

      expect(setupConfig).toHaveBeenCalled();
      expect(clearClients).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });
});
