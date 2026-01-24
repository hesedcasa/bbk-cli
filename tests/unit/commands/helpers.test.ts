import { describe, expect, it, vi } from 'vitest';

import { getCurrentVersion, printAvailableCommands, printCommandDetail } from '../../../src/commands/helpers.js';

// Mock the config module
vi.mock('../../../src/config/index.js', () => ({
  COMMANDS: [
    'list-repos',
    'get-repo',
    'list-prs',
    'get-pr',
    'create-pr',
    'update-pr',
    'add-comment',
    'delete-pr',
    'get-user',
    'test-connection',
  ],
  COMMANDS_INFO: [
    'List all accessible repositories',
    'Get details of a specific repository',
    'List pull requests in a repository',
    'Get details of a specific pull request',
    'Create a new pull request',
    'Update an existing pull request',
    'Add a comment to a pull request',
    'Delete a pull request',
    'Get user information',
    'Test Bitbucket API connection',
  ],
  COMMANDS_DETAIL: [
    '\nParameters:\n- workspace (optional): string\n- format (optional): string\n\nExample:\nlist-repos',
    '\nParameters:\n- workspace (required): string\n- repo (required): string\n\nExample:\nget-repo',
    '\nParameters:\n- workspace (required): string\n- repo (required): string\n- state (optional): string\n- limit (optional): number\n\nExample:\nlist-prs',
    '\nParameters:\n- workspace (required): string\n- repo (required): string\n- prId (required): string\n\nExample:\nget-pr',
    '\nParameters:\n- workspace (required): string\n- repo (required): string\n- title (required): string\n- sourceBranch (required): string\n- destinationBranch (required): string\n\nExample:\ncreate-pr',
    '\nParameters:\n- workspace (required): string\n- repo (required): string\n- prId (required): string\n- title (optional): string\n- description (optional): string\n\nExample:\nupdate-pr',
    '\nParameters:\n- workspace (required): string\n- repo (required): string\n- prId (required): string\n- content (required): string\n\nExample:\nadd-comment',
    '\nParameters:\n- workspace (required): string\n- repo (required): string\n- prId (required): string\n\nExample:\ndelete-pr',
    '\nParameters:\n- accountId (optional): string\n- username (optional): string\n\nExample:\nget-user',
    '\nParameters:\n- profile (optional): string\n\nExample:\ntest-connection',
  ],
}));

describe('commands/helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('printAvailableCommands', () => {
    it('should print all available commands with their descriptions', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printAvailableCommands();

      expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable commands:');
      expect(consoleLogSpy).toHaveBeenCalledWith('1. list-repos: List all accessible repositories');
      expect(consoleLogSpy).toHaveBeenCalledWith('2. get-repo: Get details of a specific repository');
      expect(consoleLogSpy).toHaveBeenCalledWith('3. list-prs: List pull requests in a repository');
      expect(consoleLogSpy).toHaveBeenCalledWith('4. get-pr: Get details of a specific pull request');
      expect(consoleLogSpy).toHaveBeenCalledWith('5. create-pr: Create a new pull request');
      expect(consoleLogSpy).toHaveBeenCalledWith('6. update-pr: Update an existing pull request');
      expect(consoleLogSpy).toHaveBeenCalledWith('7. add-comment: Add a comment to a pull request');
      expect(consoleLogSpy).toHaveBeenCalledWith('8. delete-pr: Delete a pull request');
      expect(consoleLogSpy).toHaveBeenCalledWith('9. get-user: Get user information');
      expect(consoleLogSpy).toHaveBeenCalledWith('10. test-connection: Test Bitbucket API connection');

      consoleLogSpy.mockRestore();
    });

    it('should print commands with correct numbering starting from 1', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printAvailableCommands();

      const calls = consoleLogSpy.mock.calls;
      // Find the calls that contain command numbers
      const numberCalls = calls.filter(call => call[0] && call[0].match(/^\d+\./));
      expect(numberCalls).toHaveLength(10);
      expect(numberCalls[0][0]).toBe('1. list-repos: List all accessible repositories');
      expect(numberCalls[9][0]).toBe('10. test-connection: Test Bitbucket API connection');

      consoleLogSpy.mockRestore();
    });
  });

  describe('printCommandDetail', () => {
    it('should print detailed information for a valid command', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('list-repos');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('list-repos'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('List all accessible repositories'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Parameters:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('workspace (optional)'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Example:'));

      consoleLogSpy.mockRestore();
    });

    it('should print details for get-repo command', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('get-repo');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('get-repo'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Get details of a specific repository'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('workspace (required)'));

      consoleLogSpy.mockRestore();
    });

    it('should print details for create-pr command', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('create-pr');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('create-pr'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Create a new pull request'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('workspace (required)'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('title (required)'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('sourceBranch (required)'));

      consoleLogSpy.mockRestore();
    });

    it('should print details for update-pr command', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('update-pr');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('update-pr'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update an existing pull request'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('workspace (required)'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('prId (required)'));

      consoleLogSpy.mockRestore();
    });

    it('should print details for all 10 commands', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const commands = [
        'list-repos',
        'get-repo',
        'list-prs',
        'get-pr',
        'create-pr',
        'update-pr',
        'add-comment',
        'delete-pr',
        'get-user',
        'test-connection',
      ];

      commands.forEach(command => {
        consoleLogSpy.mockClear();
        printCommandDetail(command);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(command));
      });

      consoleLogSpy.mockRestore();
    });

    it('should handle empty command string', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('');

      expect(consoleLogSpy).toHaveBeenCalledWith('Please provide a command name.');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable commands:');

      consoleLogSpy.mockRestore();
    });

    it('should handle null command', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // @ts-expect-error - Testing null input
      printCommandDetail(null);

      expect(consoleLogSpy).toHaveBeenCalledWith('Please provide a command name.');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable commands:');

      consoleLogSpy.mockRestore();
    });

    it('should handle undefined command', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // @ts-expect-error - Testing undefined input
      printCommandDetail(undefined);

      expect(consoleLogSpy).toHaveBeenCalledWith('Please provide a command name.');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable commands:');

      consoleLogSpy.mockRestore();
    });

    it('should handle whitespace-only command', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('   ');

      expect(consoleLogSpy).toHaveBeenCalledWith('Please provide a command name.');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable commands:');

      consoleLogSpy.mockRestore();
    });

    it('should show error for unknown command', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('invalid-command');

      expect(consoleLogSpy).toHaveBeenCalledWith('Unknown command: invalid-command');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable commands:');

      consoleLogSpy.mockRestore();
    });

    it('should show error for unknown command and then list available commands', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('nonexistent');

      expect(consoleLogSpy.mock.calls[0][0]).toContain('Unknown command:');
      expect(consoleLogSpy.mock.calls[1][0]).toContain('Available commands:');

      consoleLogSpy.mockRestore();
    });

    it('should trim whitespace from command name', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('  list-repos  ');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('list-repos'));
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Unknown command'));

      consoleLogSpy.mockRestore();
    });

    it('should handle commands with mixed case', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('LIST-REPOS');

      expect(consoleLogSpy).toHaveBeenCalledWith('Unknown command: LIST-REPOS');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nAvailable commands:');

      consoleLogSpy.mockRestore();
    });
  });

  describe('getCurrentVersion', () => {
    it('should return version as string', () => {
      const version = getCurrentVersion();
      expect(typeof version).toBe('string');
    });

    it('should return version in semver format', () => {
      const version = getCurrentVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
