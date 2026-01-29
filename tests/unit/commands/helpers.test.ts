import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCurrentVersion, printAvailableCommands, printCommandDetail } from '../../../src/commands/helpers.js';
import { COMMANDS, COMMANDS_INFO } from '../../../src/config/constants.js';

describe('commands/helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('printAvailableCommands', () => {
    it('should print commands in correct format with numbering', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printAvailableCommands();

      const calls = consoleLogSpy.mock.calls;
      const commandCalls = calls.filter(call => call[0] && call[0].match(/^\d+\./));

      expect(commandCalls).toHaveLength(COMMANDS.length);
      commandCalls.forEach((call, index) => {
        expect(call[0]).toMatch(/^\d+\.\s[\w-]+:\s.+/);
        expect(call[0]).toContain(`${index + 1}.`);
        expect(call[0]).toContain(COMMANDS[index]);
        expect(call[0]).toContain(COMMANDS_INFO[index]);
      });

      consoleLogSpy.mockRestore();
    });

    it('should print all command names in output', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printAvailableCommands();

      const output = consoleLogSpy.mock.calls.map(call => call[0]).join(' ');
      COMMANDS.forEach(command => {
        expect(output).toContain(command);
      });

      consoleLogSpy.mockRestore();
    });

    it('should start numbering from 1 and end at command count', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printAvailableCommands();

      const calls = consoleLogSpy.mock.calls;
      const numberCalls = calls.filter(call => call[0] && call[0].match(/^\d+\./));

      expect(numberCalls[0][0]).toMatch(/^1\.\s/);
      expect(numberCalls[numberCalls.length - 1][0]).toMatch(new RegExp(`^${COMMANDS.length}\\.\\s`));

      consoleLogSpy.mockRestore();
    });
  });

  describe('printCommandDetail', () => {
    it('should print details for all commands', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      COMMANDS.forEach(command => {
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

      printCommandDetail('  list-repositories  ');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('list-repositories'));
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Unknown command'));

      consoleLogSpy.mockRestore();
    });

    it('should handle commands with mixed case', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      printCommandDetail('LIST-REPOSITORIES');

      expect(consoleLogSpy).toHaveBeenCalledWith('Unknown command: LIST-REPOSITORIES');
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
