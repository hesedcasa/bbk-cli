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
 * @param currentValue - Existing email value to pre-populate in input buffer
 */
async function promptEmail(currentValue?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    const ask = () => {
      // Pre-fill existing value in input buffer for editing
      if (currentValue) {
        rl.write(currentValue);
      }
      rl.question('email: ', email => {
        email = email.trim();
        // If user presses Enter without input, keep existing value
        if (!email && currentValue) {
          rl.close();
          resolve(currentValue);
          return;
        }
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
 * @param currentValue - Existing api_token value (pre-filled as masked)
 */
async function promptApiToken(currentValue?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    const ask = () => {
      // Pre-fill masked value for visual indication
      if (currentValue) {
        rl.write('********');
      }
      rl.question('api_token: ', apiToken => {
        apiToken = apiToken.trim();
        // Remove all asterisks from input (user may have deleted the pre-filled mask)
        const withoutAsterisks = apiToken.replace(/\*/g, '');
        // If user input is empty after removing asterisks and there's an existing value, keep it
        if (!withoutAsterisks && currentValue) {
          rl.close();
          resolve(currentValue);
          return;
        }
        if (!withoutAsterisks) {
          console.log('API token is required.');
          ask();
          return;
        }
        rl.close();
        resolve(withoutAsterisks);
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
 * @param currentValue - Existing workspace value to pre-populate in input buffer
 */
async function promptWorkspace(currentValue?: string): Promise<string | undefined> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    // Pre-fill existing value in input buffer for editing
    if (currentValue) {
      rl.write(currentValue);
    }
    rl.question('workspace: ', workspace => {
      workspace = workspace.trim();
      rl.close();
      // If user presses Enter without input, keep existing value or undefined
      resolve(workspace || currentValue);
    });

    rl.on('error', error => {
      reject(new Error(`Failed to read input: ${error.message}`));
    });
  });
}

/**
 * Prompt for format preference (json/toon)
 * @param currentValue - Existing format value to pre-populate in input buffer
 */
async function promptFormat(currentValue: 'json' | 'toon' = 'json'): Promise<'json' | 'toon'> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    const ask = () => {
      // Pre-fill existing value in input buffer for editing
      rl.write(currentValue);
      rl.question('format: ', format => {
        format = format.trim().toLowerCase();
        // If user presses Enter without input, keep existing value
        if (!format) {
          rl.close();
          resolve(currentValue);
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
 * If config file exists, pre-populates existing values in input buffer
 */
export async function setupConfig(): Promise<void> {
  const configPath = path.join(os.homedir(), '.bbkcli');

  // Load existing config if it exists
  let existingConfig: Partial<Config> = {};
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      existingConfig = parseIniConfig(content);
    } catch {
      // Failed to read existing config file; proceed to create a new configuration.
    }
  }

  // Collect credentials (with existing values pre-populated in input buffer)
  const email = await promptEmail(existingConfig.email);
  const apiToken = await promptApiToken(existingConfig.apiToken);

  // Optional fields (with existing values pre-populated in input buffer)
  const defaultWorkspace = await promptWorkspace(existingConfig.defaultWorkspace);
  const format = await promptFormat(existingConfig.defaultFormat);

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
    console.log(`\n✓ Config saved to ${configPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot write config: ${errorMessage}`);
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
    throw new Error(`Please run: bbk-cli config`);
  }

  let content: string;
  try {
    content = fs.readFileSync(configPath, 'utf-8');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Cannot read config: ${errorMessage}`);
  }

  const config = parseIniConfig(content);

  // Validate required fields (should be valid after setup, but double-check)
  if (!config.email || !config.apiToken) {
    throw new Error(`Missing "email" or "api_token" in ${configPath}`);
  }

  // Validate email format
  if (!isValidEmail(config.email)) {
    throw new Error(`Invalid email: ${config.email} in ${configPath}`);
  }

  return {
    email: config.email,
    apiToken: config.apiToken,
    defaultWorkspace: config.defaultWorkspace,
    defaultFormat: config.defaultFormat || 'json',
  };
}
