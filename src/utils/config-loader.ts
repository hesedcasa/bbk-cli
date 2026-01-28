import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'readline';

/**
 * Main configuration structure
 */
export interface Config {
  email: string;
  apiToken: string;
  defaultWorkspace?: string;
  defaultFormat: 'json' | 'toon';
}

/**
 * Parse INI-style config file content
 */
function parseIniConfig(content: string): Partial<Config> {
  const config: Partial<Config> = {};
  const lines = content.split('\n');
  let currentSection: string | null = null;
  const warnings: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // Section header
    const sectionMatch = trimmedLine.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      if (!['auth', 'defaults'].includes(currentSection)) {
        warnings.push(`Unknown section: [${currentSection}]`);
      }
      continue;
    }

    // Key-value pair
    const keyValueMatch = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (keyValueMatch && currentSection) {
      const key = keyValueMatch[1].trim();
      const value = keyValueMatch[2].trim();

      if (currentSection === 'auth') {
        if (key === 'email') {
          config.email = value;
        } else if (key === 'api_token') {
          config.apiToken = value;
        } else {
          warnings.push(`Unknown key in [auth]: ${key}`);
        }
      } else if (currentSection === 'defaults') {
        if (key === 'workspace' && value) {
          config.defaultWorkspace = value;
        } else if (key === 'format') {
          if (value === 'json' || value === 'toon') {
            config.defaultFormat = value;
          } else {
            warnings.push(`Invalid format value: "${value}". Must be 'json' or 'toon'.`);
          }
        } else if (key === 'workplace' && value) {
          // Backward compatibility: accept old "workplace" key
          config.defaultWorkspace = value;
          warnings.push(`Key "workplace" is deprecated. Use "workspace" instead.`);
        } else if (key) {
          warnings.push(`Unknown key in [defaults]: ${key}`);
        }
      }
    }
  }

  // Log warnings if any
  if (warnings.length > 0) {
    console.warn('Configuration warnings:');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }

  return config;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Prompt for email with validation
 */
async function promptEmail(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    const ask = () => {
      rl.question('email: ', email => {
        email = email.trim();
        if (!email) {
          console.log('Email is required.');
          ask();
          return;
        }
        if (!isValidEmail(email)) {
          console.log('Invalid email format. Please try again.');
          ask();
          return;
        }
        rl.close();
        resolve(email);
      });
    };

    rl.on('error', error => {
      reject(new Error(`Failed to read input: ${error.message}`));
    });

    ask();
  });
}

/**
 * Prompt for api_token with hidden input
 */
async function promptApiToken(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    const ask = () => {
      rl.question('api_token: ', apiToken => {
        apiToken = apiToken.trim();
        if (!apiToken) {
          console.log('API token is required.');
          ask();
          return;
        }
        rl.close();
        resolve(apiToken);
      });
    };

    rl.on('error', error => {
      reject(new Error(`Failed to read input: ${error.message}`));
    });

    ask();
  });
}

/**
 * Prompt for optional default workspace
 */
async function promptWorkspace(): Promise<string | undefined> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('workspace: ', workspace => {
      workspace = workspace.trim();
      rl.close();
      resolve(workspace || undefined);
    });

    rl.on('error', error => {
      reject(new Error(`Failed to read input: ${error.message}`));
    });
  });
}

/**
 * Prompt for format preference (json/toon)
 */
async function promptFormat(): Promise<'json' | 'toon'> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    const ask = () => {
      rl.question('format: ', format => {
        format = format.trim().toLowerCase();
        if (!format) {
          rl.close();
          resolve('json');
          return;
        }
        if (format === 'json' || format === 'toon') {
          rl.close();
          resolve(format as 'json' | 'toon');
          return;
        }
        console.log('Invalid format. Please choose json or toon.');
        ask();
      });
    };

    rl.on('error', error => {
      reject(new Error(`Failed to read input: ${error.message}`));
    });

    ask();
  });
}

/**
 * Interactive config setup using readline
 * Prompts user for email and api_token, then writes config file
 */
export async function setupConfig(): Promise<void> {
  const configPath = path.join(os.homedir(), '.bbkcli');

  // Collect credentials
  const email = await promptEmail();
  const apiToken = await promptApiToken();

  // Optional fields
  const defaultWorkspace = await promptWorkspace();
  const format = await promptFormat();

  // Write config file
  let configContent = `[auth]
email=${email}
api_token=${apiToken}
`;

  if (defaultWorkspace || format !== 'json') {
    configContent += `\n[defaults]\n`;
    if (defaultWorkspace) {
      configContent += `workspace=${defaultWorkspace}\n`;
    }
    if (format !== 'json') {
      configContent += `format=${format}\n`;
    }
  }

  try {
    fs.writeFileSync(configPath, configContent, { mode: 0o600 }); // Read/write for owner only
    console.log(`\n✓ Configuration saved to ${configPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to write config file: ${errorMessage}\n\nMake sure you have permission to write to ${configPath}`
    );
  }
}

/**
 * Load Bitbucket connection configuration from ~/.bbkcli
 *
 * @returns Configuration object with auth settings and defaults
 * @throws Error if config file doesn't exist or is invalid
 */
export function loadConfig(): Config {
  const configPath = path.join(os.homedir(), '.bbkcli');

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Configuration file not found at ${configPath}\n\nTo fix this issue:\n  Run: bbk-cli config\n  This will start the interactive configuration setup.`
    );
  }

  let content: string;
  try {
    content = fs.readFileSync(configPath, 'utf-8');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read configuration file at ${configPath}: ${errorMessage}\n\nCheck file permissions and try again.`
    );
  }

  const config = parseIniConfig(content);

  // Validate required fields (should be valid after setup, but double-check)
  if (!config.email || !config.apiToken) {
    throw new Error(
      `Configuration must include both "email" and "api_token" in the [auth] section\n\n` +
        `Current configuration file: ${configPath}`
    );
  }

  // Validate email format
  if (!isValidEmail(config.email)) {
    throw new Error(
      `Invalid email format: "${config.email}"\n\n` + `Please check your configuration file at: ${configPath}`
    );
  }

  return {
    email: config.email,
    apiToken: config.apiToken,
    defaultWorkspace: config.defaultWorkspace,
    defaultFormat: config.defaultFormat || 'json',
  };
}
