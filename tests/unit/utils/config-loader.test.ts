import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { loadConfig } from '../../../src/utils/config-loader.js';

describe('config-loader', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a temporary directory for test configs
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'conni-cli-test-'));
    fs.mkdirSync(path.join(testDir, '.claude'));
  });

  afterEach(() => {
    // Clean up test directory
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('loadConfig', () => {
    it('should load valid Bitbucket configuration file', () => {
      const configContent = `---
profiles:
  cloud:
    username: user@example.com
    password: app_password_here
  staging:
    username: staging@example.com
    token: staging_token_here

defaultProfile: cloud
defaultFormat: json
---

# Bitbucket Connection Profiles
`;

      const configPath = path.join(testDir, '.claude', 'bitbucket-config.local.md');
      fs.writeFileSync(configPath, configContent);

      const config = loadConfig(testDir);

      expect(config.profiles).toBeDefined();
      expect(config.profiles.cloud).toBeDefined();
      expect(config.profiles.cloud.username).toBe('user@example.com');
      expect(config.profiles.cloud.password).toBe('app_password_here');

      expect(config.profiles.staging).toBeDefined();
      expect(config.profiles.staging.token).toBe('staging_token_here');

      expect(config.defaultProfile).toBe('cloud');
      expect(config.defaultFormat).toBe('json');
    });

    it('should throw error if config file does not exist', () => {
      expect(() => loadConfig(testDir)).toThrow('Configuration file not found');
    });

    it('should throw error if frontmatter is missing', () => {
      const configContent = `# Bitbucket Connection Profiles

This is just markdown content without frontmatter.
`;

      const configPath = path.join(testDir, '.claude', 'bitbucket-config.local.md');
      fs.writeFileSync(configPath, configContent);

      expect(() => loadConfig(testDir)).toThrow('Invalid configuration file format');
    });

    it('should throw error if profiles are missing', () => {
      const configContent = `---
defaultProfile: cloud
---
`;

      const configPath = path.join(testDir, '.claude', 'bitbucket-config.local.md');
      fs.writeFileSync(configPath, configContent);

      expect(() => loadConfig(testDir)).toThrow('Configuration must include "profiles" object');
    });

    it('should throw error if profile is missing required auth fields', () => {
      const configContent = `---
profiles:
  incomplete:
    username: test
    # Missing password (when using username auth)
---
`;

      const configPath = path.join(testDir, '.claude', 'bitbucket-config.local.md');
      fs.writeFileSync(configPath, configContent);

      expect(() => loadConfig(testDir)).toThrow('must have either "token" or both "username" and "password"');
    });

    it('should use first profile as default if defaultProfile not specified', () => {
      const configContent = `---
profiles:
  first:
    username: first@example.com
    password: first_password
  second:
    token: second_token
---
`;

      const configPath = path.join(testDir, '.claude', 'bitbucket-config.local.md');
      fs.writeFileSync(configPath, configContent);

      const config = loadConfig(testDir);

      expect(config.defaultProfile).toBe('first');
    });

    it('should use json as default format if not specified', () => {
      const configContent = `---
profiles:
  cloud:
    username: user@example.com
    password: password_here
---
`;

      const configPath = path.join(testDir, '.claude', 'bitbucket-config.local.md');
      fs.writeFileSync(configPath, configContent);

      const config = loadConfig(testDir);

      expect(config.defaultFormat).toBe('json');
    });

    it('should support all output formats: json, toon', () => {
      const formats: Array<'json' | 'toon'> = ['json', 'toon'];

      formats.forEach(format => {
        const configContent = `---
profiles:
  cloud:
    token: token_here
defaultFormat: ${format}
---
`;

        const configPath = path.join(testDir, '.claude', 'bitbucket-config.local.md');
        fs.writeFileSync(configPath, configContent);

        const config = loadConfig(testDir);
        expect(config.defaultFormat).toBe(format);
      });
    });
  });
});
