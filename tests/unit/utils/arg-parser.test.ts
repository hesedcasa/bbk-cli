import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseArguments } from '../../../src/utils/arg-parser.js';

// Mock the imported modules
vi.mock('../../../src/commands/index.js', () => ({
  getCurrentVersion: vi.fn().mockReturnValue('0.0.0'),
  printAvailableCommands: vi.fn(),
  printCommandDetail: vi.fn(),
  runCommand: vi.fn(),
}));

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
}));

describe('arg-parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseArguments', () => {
    it('should handle --version flag', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
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

    it('should handle -v flag (short version)', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await parseArguments(['-v']);
      } catch {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith('0.0.0');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should handle --commands flag', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const { printAvailableCommands } = await import('../../../src/commands/index.js');

      try {
        await parseArguments(['--commands']);
      } catch {
        // Expected
      }

      expect(printAvailableCommands).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });

    it('should handle command -h for command-specific help', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const { printCommandDetail } = await import('../../../src/commands/index.js');

      try {
        await parseArguments(['list-repos', '-h']);
      } catch {
        // Expected
      }

      expect(printCommandDetail).toHaveBeenCalledWith('list-repos');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });

    it('should handle --help flag', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await parseArguments(['--help']);
      } catch {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Bitbucket CLI'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should handle -h flag (short help)', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await parseArguments(['-h']);
      } catch {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Bitbucket CLI'));
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should execute valid command in headless mode', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const { runCommand } = await import('../../../src/commands/index.js');

      try {
        await parseArguments(['list-repos', '{"workspace":"myworkspace"}']);
      } catch {
        // Expected
      }

      expect(runCommand).toHaveBeenCalledWith('list-repos', '{"workspace":"myworkspace"}', null);
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });

    it('should execute command without arguments', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const { runCommand } = await import('../../../src/commands/index.js');

      try {
        await parseArguments(['test-connection']);
      } catch {
        // Expected
      }

      expect(runCommand).toHaveBeenCalledWith('test-connection', null, null);
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });

    it('should parse command with flag parameter', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const { runCommand } = await import('../../../src/commands/index.js');

      try {
        await parseArguments(['get-repo', '{"workspace":"myworkspace","repo":"myrepo"}', '--format', 'json']);
      } catch {
        // Expected
      }

      expect(runCommand).toHaveBeenCalledWith('get-repo', '{"workspace":"myworkspace","repo":"myrepo"}', '--format');
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });

    it('should return false for interactive mode (no arguments)', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const result = await parseArguments([]);

      expect(result).toBe(false);
      expect(exitSpy).not.toHaveBeenCalled();

      exitSpy.mockRestore();
    });

    it('should return false for empty arguments', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const result = await parseArguments([]);

      expect(result).toBe(false);
      expect(exitSpy).not.toHaveBeenCalled();

      exitSpy.mockRestore();
    });

    it('should return false for unrecognized flags when not first argument', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      const result = await parseArguments(['--unknown']);

      expect(result).toBe(false);
      expect(exitSpy).not.toHaveBeenCalled();

      exitSpy.mockRestore();
    });

    it('should prioritize --version flag even if other arguments exist', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { runCommand } = await import('../../../src/commands/index.js');

      try {
        await parseArguments(['--version', 'list-repos', '{"workspace":"myworkspace"}']);
      } catch {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith('0.0.0');
      expect(exitSpy).toHaveBeenCalledWith(0);
      expect(runCommand).not.toHaveBeenCalled();

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should prioritize --commands flag', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const { printAvailableCommands } = await import('../../../src/commands/index.js');
      const { runCommand } = await import('../../../src/commands/index.js');

      try {
        await parseArguments(['--commands', 'list-repos']);
      } catch {
        // Expected
      }

      expect(printAvailableCommands).toHaveBeenCalled();
      expect(runCommand).not.toHaveBeenCalled();

      exitSpy.mockRestore();
    });

    it('should handle all 10 commands as valid', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const { runCommand } = await import('../../../src/commands/index.js');

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

      for (const cmd of commands) {
        try {
          await parseArguments([cmd]);
        } catch {
          // Expected for each command
        }
      }

      expect(runCommand).toHaveBeenCalledTimes(commands.length);

      exitSpy.mockRestore();
    });
  });

  describe('printGeneralHelp', () => {
    it('should display help message with all commands', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await parseArguments(['--help']);
      } catch {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Bitbucket CLI'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('bbk-cli'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('bbk-cli --commands'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('list-repos'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should display examples section', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((): never => {
        throw new Error('process.exit called');
      });
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await parseArguments(['--help']);
      } catch {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Examples:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('bbk-cli list-repositories'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('bbk-cli get-repository'));

      exitSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });
});
