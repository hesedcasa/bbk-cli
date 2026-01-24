import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

/**
 * Bitbucket connection profile configuration
 */
interface BitbucketProfile {
  username: string;
  password: string; // App password (Bitbucket API token)
}

/**
 * Main configuration structure
 */
export interface Config {
  profiles: Record<string, BitbucketProfile>;
  defaultProfile: string;
  defaultFormat: 'json' | 'toon';
}

/**
 * Bitbucket client options for basic auth
 */
interface BitbucketClientOptions {
  auth: {
    username: string;
    password: string; // App password (Bitbucket API token)
  };
}

/**
 * Load Bitbucket connection profiles from .claude/bitbucket-config.local.md
 *
 * @param projectRoot - Project root directory
 * @returns Configuration object with profiles and settings
 */
export function loadConfig(projectRoot: string): Config {
  const configPath = path.join(projectRoot, '.claude', 'bitbucket-config.local.md');

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Configuration file not found at ${configPath}\n` +
        `Please create .claude/bitbucket-config.local.md with your Bitbucket profiles.`
    );
  }

  const content = fs.readFileSync(configPath, 'utf-8');

  // Extract YAML frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const frontmatterMatch = frontmatterRegex.exec(content);

  if (!frontmatterMatch) {
    throw new Error(`Invalid configuration file format. Expected YAML frontmatter (---...---) at the beginning.`);
  }

  const frontmatter = frontmatterMatch[1];
  const config = yaml.parse(frontmatter) as Partial<Config>;

  // Validate configuration
  if (!config.profiles || typeof config.profiles !== 'object') {
    throw new Error('Configuration must include "profiles" object');
  }

  // Validate each profile
  for (const [profileName, profile] of Object.entries(config.profiles)) {
    // Username and password (app password) are required
    if (!profile.username || !profile.password) {
      throw new Error(`Profile "${profileName}" must have both "username" and "password" (app password)`);
    }
  }

  return {
    profiles: config.profiles,
    defaultProfile: config.defaultProfile || Object.keys(config.profiles)[0],
    defaultFormat: config.defaultFormat || 'json',
  };
}

/**
 * Get Bitbucket client options for a specific profile
 *
 * @param config - Configuration object
 * @param profileName - Profile name
 * @returns Bitbucket client options object with basic auth
 */
export function getBitbucketClientOptions(config: Config, profileName: string): BitbucketClientOptions {
  const profile = config.profiles[profileName];

  if (!profile) {
    const availableProfiles = Object.keys(config.profiles).join(', ');
    throw new Error(`Profile "${profileName}" not found. Available profiles: ${availableProfiles}`);
  }

  if (!profile.username || !profile.password) {
    throw new Error(`Profile "${profileName}" must have both "username" and "password" (app password)`);
  }

  return {
    auth: {
      username: profile.username,
      password: profile.password,
    },
  };
}
