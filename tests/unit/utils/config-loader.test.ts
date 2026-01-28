import fs from 'fs';
import os from 'node:os';
import path from 'node:path';
import * as readline from 'node:readline';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadConfig, setupConfig } from '../../../src/utils/config-loader.js';

describe('config-loader', () => {
  describe('loadConfig', () => {
    let testConfigDir: string;
    let originalHomedir: string;

    beforeEach(() => {
      // Create a temporary directory for test configs
      testConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bbk-cli-test-'));
      originalHomedir = process.env.HOME || '';
      process.env.HOME = testConfigDir;
    });

    afterEach(() => {
      // Clean up test directory
      if (testConfigDir) {
        fs.rmSync(testConfigDir, { recursive: true, force: true });
      }
      process.env.HOME = originalHomedir;
    });

    it('should load valid INI configuration file', async () => {
      const configContent = `[auth]
email=user@example.com
api_token=app_token_here

[defaults]
workspace=myworkspace
format=json
`;

      const configPath = path.join(testConfigDir, '.bbkcli');
      fs.writeFileSync(configPath, configContent);

      const config = await loadConfig();

      expect(config.email).toBe('user@example.com');
      expect(config.apiToken).toBe('app_token_here');
      expect(config.defaultWorkspace).toBe('myworkspace');
      expect(config.defaultFormat).toBe('json');
    });

    it('should load config without optional default workspace', async () => {
      const configContent = `[auth]
email=user@example.com
api_token=app_token_here

[defaults]
format=json
`;

      const configPath = path.join(testConfigDir, '.bbkcli');
      fs.writeFileSync(configPath, configContent);

      const config = await loadConfig();

      expect(config.email).toBe('user@example.com');
      expect(config.apiToken).toBe('app_token_here');
      expect(config.defaultWorkspace).toBeUndefined();
      expect(config.defaultFormat).toBe('json');
    });

    it('should use json as default format if not specified', async () => {
      const configContent = `[auth]
email=user@example.com
api_token=app_token_here
`;

      const configPath = path.join(testConfigDir, '.bbkcli');
      fs.writeFileSync(configPath, configContent);

      const config = await loadConfig();

      expect(config.defaultFormat).toBe('json');
    });

    it('should support all output formats: json, toon', async () => {
      const formats: Array<'json' | 'toon'> = ['json', 'toon'];

      for (const format of formats) {
        const configContent = `[auth]
email=user@example.com
api_token=app_token_here

[defaults]
format=${format}
`;

        const configPath = path.join(testConfigDir, '.bbkcli');
        fs.writeFileSync(configPath, configContent);

        const config = await loadConfig();
        expect(config.defaultFormat).toBe(format);

        // Clean up for next iteration
        fs.rmSync(configPath);
      }
    });

    it('should handle comments and empty lines in config file', async () => {
      const configContent = `# This is a comment
[auth]
email=user@example.com
api_token=app_token_here

# Another comment

[defaults]
workspace=myworkspace

# format comment
format=json
`;

      const configPath = path.join(testConfigDir, '.bbkcli');
      fs.writeFileSync(configPath, configContent);

      const config = await loadConfig();

      expect(config.email).toBe('user@example.com');
      expect(config.apiToken).toBe('app_token_here');
      expect(config.defaultWorkspace).toBe('myworkspace');
      expect(config.defaultFormat).toBe('json');
    });
  });

  describe('setupConfig', () => {
    let testConfigDir: string;
    let originalHomedir: string;

    beforeEach(() => {
      testConfigDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bbk-cli-test-'));
      originalHomedir = process.env.HOME || '';
      process.env.HOME = testConfigDir;
    });

    afterEach(() => {
      if (testConfigDir) {
        fs.rmSync(testConfigDir, { recursive: true, force: true });
      }
      process.env.HOME = originalHomedir;
      vi.restoreAllMocks();
    });

    it('should create config file with all fields', async () => {
      // Mock readline to provide all inputs
      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi
          .fn()
          .mockImplementationOnce((_, callback) => callback('user@example.com'))
          .mockImplementationOnce((_, callback) => callback('test_token'))
          .mockImplementationOnce((_, callback) => callback('myworkspace'))
          .mockImplementationOnce((_, callback) => callback('toon')), // Use non-default format
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      expect(fs.existsSync(configPath)).toBe(true);

      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('[auth]');
      expect(content).toContain('email=user@example.com');
      expect(content).toContain('api_token=test_token');
      expect(content).toContain('[defaults]');
      expect(content).toContain('workspace=myworkspace');
      expect(content).toContain('format=toon');

      // Check file permissions (0o600 = read/write for owner only)
      const stats = fs.statSync(configPath);
      const mode = stats.mode & 0o777;
      expect(mode).toBe(0o600);

      mockCreateInterface.mockRestore();
    });

    it('should create minimal config file with only required fields', async () => {
      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi
          .fn()
          .mockImplementationOnce((_, callback) => callback('minimal@example.com'))
          .mockImplementationOnce((_, callback) => callback('minimal_token'))
          .mockImplementationOnce((_, callback) => callback('')) // empty workspace
          .mockImplementationOnce((_, callback) => callback('')), // empty format (defaults to json)
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      const content = fs.readFileSync(configPath, 'utf-8');

      expect(content).toContain('[auth]');
      expect(content).toContain('email=minimal@example.com');
      expect(content).toContain('api_token=minimal_token');
      // Should not include defaults section when both are empty
      expect(content).not.toContain('[defaults]');

      mockCreateInterface.mockRestore();
    });

    it('should reject invalid email format and re-prompt', async () => {
      const emailInputs = ['invalid-email', 'still-invalid', 'valid@example.com'];
      let emailInputIndex = 0;

      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi.fn().mockImplementation((prompt, callback) => {
          if (prompt.includes('email:')) {
            callback(emailInputs[emailInputIndex++]);
          } else if (prompt.includes('api_token:')) {
            callback('token');
          } else if (prompt.includes('workspace:')) {
            callback('');
          } else if (prompt.includes('format:')) {
            callback('');
          }
        }),
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('email=valid@example.com');

      mockCreateInterface.mockRestore();
    });

    it('should reject empty email and re-prompt', async () => {
      const emailInputs = ['', 'test@example.com'];
      let emailInputIndex = 0;

      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi.fn().mockImplementation((prompt, callback) => {
          if (prompt.includes('email:')) {
            callback(emailInputs[emailInputIndex++]);
          } else if (prompt.includes('api_token:')) {
            callback('token');
          } else if (prompt.includes('workspace:')) {
            callback('');
          } else if (prompt.includes('format:')) {
            callback('');
          }
        }),
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('email=test@example.com');

      mockCreateInterface.mockRestore();
    });

    it('should reject empty api_token and re-prompt', async () => {
      const tokenInputs = ['', 'real_token'];
      let tokenInputIndex = 0;

      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi.fn().mockImplementation((prompt, callback) => {
          if (prompt.includes('email:')) {
            callback('test@example.com');
          } else if (prompt.includes('api_token:')) {
            callback(tokenInputs[tokenInputIndex++]);
          } else if (prompt.includes('workspace:')) {
            callback('');
          } else if (prompt.includes('format:')) {
            callback('');
          }
        }),
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('api_token=real_token');

      mockCreateInterface.mockRestore();
    });

    it('should reject invalid format and re-prompt', async () => {
      const formatInputs = ['xml', 'toon']; // Use non-default format
      let formatInputIndex = 0;

      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi.fn().mockImplementation((prompt, callback) => {
          if (prompt.includes('email:')) {
            callback('test@example.com');
          } else if (prompt.includes('api_token:')) {
            callback('token');
          } else if (prompt.includes('workspace:')) {
            callback('ws');
          } else if (prompt.includes('format:')) {
            callback(formatInputs[formatInputIndex++]);
          }
        }),
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('format=toon');

      mockCreateInterface.mockRestore();
    });

    it('should handle write permission errors gracefully', async () => {
      // Create a directory instead of a file to cause write error
      const existingPath = path.join(testConfigDir, '.bbkcli');
      fs.mkdirSync(existingPath);

      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi
          .fn()
          .mockImplementationOnce((_, callback) => callback('test@example.com'))
          .mockImplementationOnce((_, callback) => callback('token'))
          .mockImplementationOnce((_, callback) => callback('ws'))
          .mockImplementationOnce((_, callback) => callback('json')),
        close: vi.fn(),
        on: vi.fn(),
      });

      await expect(setupConfig()).rejects.toThrow('Failed to write config file');

      mockCreateInterface.mockRestore();
    });

    it('should include defaults section when only format is specified', async () => {
      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi
          .fn()
          .mockImplementationOnce((_, callback) => callback('test@example.com'))
          .mockImplementationOnce((_, callback) => callback('token'))
          .mockImplementationOnce((_, callback) => callback('')) // empty workspace
          .mockImplementationOnce((_, callback) => callback('toon')), // non-default format
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      const content = fs.readFileSync(configPath, 'utf-8');

      expect(content).toContain('[defaults]');
      expect(content).toContain('format=toon');
      expect(content).not.toContain('workspace=');

      mockCreateInterface.mockRestore();
    });

    it('should include defaults section when only workspace is specified', async () => {
      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi
          .fn()
          .mockImplementationOnce((_, callback) => callback('test@example.com'))
          .mockImplementationOnce((_, callback) => callback('token'))
          .mockImplementationOnce((_, callback) => callback('myworkspace'))
          .mockImplementationOnce((_, callback) => callback('')), // empty format (defaults to json)
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      const content = fs.readFileSync(configPath, 'utf-8');

      expect(content).toContain('[defaults]');
      expect(content).toContain('workspace=myworkspace');
      expect(content).not.toContain('format=');

      mockCreateInterface.mockRestore();
    });

    it('should set secure file permissions (0o600)', async () => {
      const mockCreateInterface = vi.spyOn(readline, 'createInterface').mockReturnValue({
        question: vi
          .fn()
          .mockImplementationOnce((_, callback) => callback('secure@example.com'))
          .mockImplementationOnce((_, callback) => callback('secure_token'))
          .mockImplementationOnce((_, callback) => callback('workspace'))
          .mockImplementationOnce((_, callback) => callback('toon')),
        close: vi.fn(),
        on: vi.fn(),
      });

      await setupConfig();

      const configPath = path.join(testConfigDir, '.bbkcli');
      const stats = fs.statSync(configPath);
      const mode = stats.mode & 0o777;

      // 0o600 = read/write for owner only (rw-------)
      expect(mode).toBe(0o600);

      mockCreateInterface.mockRestore();
    });
  });
});
