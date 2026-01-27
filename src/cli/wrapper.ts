import readline from 'readline';

import { getCurrentVersion, printAvailableCommands, printCommandDetail } from '../commands/index.js';
import { COMMANDS } from '../config/index.js';
import {
  clearClients,
  createIssue,
  createPullRequest,
  getIssue,
  getPullRequest,
  getRepository,
  getUser,
  listBranches,
  listCommits,
  listIssues,
  listPipelines,
  listPullRequests,
  listRepositories,
  loadConfig,
  testConnection,
} from '../utils/index.js';
import type { Config } from '../utils/index.js';

/**
 * Main CLI class for Bitbucket interaction
 */
export class wrapper {
  private rl: readline.Interface;
  private config: Config | null = null;
  private currentProfile: string | null = null;
  private currentFormat: 'json' | 'toon' = 'json';

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'bbk> ',
    });
  }

  /**
   * Initialize the CLI and load configuration
   */
  async connect(): Promise<void> {
    try {
      const projectRoot = process.env.CLAUDE_PROJECT_ROOT || process.cwd();
      this.config = loadConfig(projectRoot);
      this.currentProfile = this.config.defaultProfile;
      this.currentFormat = this.config.defaultFormat;

      this.printHelp();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to load configuration:', errorMessage);
      console.error('\nMake sure:');
      console.error('1. .claude/bitbucket-config.local.md exists');
      console.error('2. The file contains valid Bitbucket profiles in YAML frontmatter');
      process.exit(1);
    }
  }

  /**
   * Handles user input commands
   * @param input - The raw user input string
   */
  private async handleCommand(input: string): Promise<void> {
    const trimmed = input.trim();

    if (!trimmed) {
      this.rl.prompt();
      return;
    }

    // Handle special commands
    if (trimmed === 'exit' || trimmed === 'quit' || trimmed === 'q') {
      await this.disconnect();
      return;
    }

    if (trimmed === 'help' || trimmed === '?') {
      this.printHelp();
      this.rl.prompt();
      return;
    }

    if (trimmed === 'commands') {
      printAvailableCommands();
      this.rl.prompt();
      return;
    }

    if (trimmed === 'clear') {
      console.clear();
      this.rl.prompt();
      return;
    }

    if (trimmed.startsWith('profile ')) {
      const newProfile = trimmed.substring(8).trim();
      if (this.config && this.config.profiles[newProfile]) {
        this.currentProfile = newProfile;
        console.log(`Switched to profile: ${newProfile}`);
      } else {
        const available = this.config ? Object.keys(this.config.profiles).join(', ') : 'none';
        console.error(`ERROR: Profile "${newProfile}" not found. Available: ${available}`);
      }
      this.rl.prompt();
      return;
    }

    if (trimmed.startsWith('format ')) {
      const newFormat = trimmed.substring(7).trim() as 'json' | 'toon';
      if (['json', 'toon'].includes(newFormat)) {
        this.currentFormat = newFormat;
        console.log(`Output format set to: ${newFormat}`);
      } else {
        console.error('ERROR: Invalid format. Choose: json or toon');
      }
      this.rl.prompt();
      return;
    }

    if (trimmed === 'profiles') {
      if (this.config) {
        console.log('\nAvailable profiles:');
        Object.keys(this.config.profiles).forEach((name, i) => {
          const current = name === this.currentProfile ? ' (current)' : '';
          console.log(`${i + 1}. ${name}${current}`);
        });
      }
      this.rl.prompt();
      return;
    }

    // Parse command invocation: command [args...]
    const firstSpaceIndex = trimmed.indexOf(' ');
    const command = firstSpaceIndex === -1 ? trimmed : trimmed.substring(0, firstSpaceIndex);
    const arg = firstSpaceIndex === -1 ? '' : trimmed.substring(firstSpaceIndex + 1).trim();

    if (arg === '-h') {
      printCommandDetail(command);
      this.rl.prompt();
      return;
    }

    await this.runCommand(command, arg);
  }

  /**
   * Runs a Bitbucket command
   * @param command - The command name to execute
   * @param arg - JSON string or null for the command arguments
   */
  private async runCommand(command: string, arg: string): Promise<void> {
    if (!this.config || !this.currentProfile) {
      console.log('Configuration not loaded!');
      this.rl.prompt();
      return;
    }

    try {
      // Parse arguments
      const args = arg && arg.trim() !== '' ? JSON.parse(arg) : {};
      const profile = args.profile || this.currentProfile;
      const format = args.format || this.currentFormat;

      let result;

      switch (command) {
        case 'list-repositories':
          result = await listRepositories(profile, args.workspace, format);
          break;

        case 'get-repository':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await getRepository(profile, args.workspace, args.repoSlug, format);
          break;

        case 'list-pullrequests':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await listPullRequests(profile, args.workspace, args.repoSlug, args.state, format);
          break;

        case 'get-pullrequest':
          if (!args.repoSlug || !args.pullRequestId) {
            console.error('ERROR: "repoSlug" and "pullRequestId" parameters are required');
            this.rl.prompt();
            return;
          }
          result = await getPullRequest(profile, args.workspace, args.repoSlug, args.pullRequestId, format);
          break;

        case 'create-pullrequest':
          if (!args.repoSlug || !args.title || !args.sourceBranch || !args.destinationBranch) {
            console.error(
              'ERROR: "repoSlug", "title", "sourceBranch", and "destinationBranch" parameters are required'
            );
            this.rl.prompt();
            return;
          }
          result = await createPullRequest(
            profile,
            args.workspace,
            args.repoSlug,
            args.title,
            args.sourceBranch,
            args.destinationBranch,
            args.description,
            format
          );
          break;

        case 'list-branches':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await listBranches(profile, args.workspace, args.repoSlug, args.q, args.sort, format);
          break;

        case 'list-commits':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await listCommits(profile, args.workspace, args.repoSlug, args.branch, format);
          break;

        case 'list-issues':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await listIssues(profile, args.workspace, args.repoSlug, format);
          break;

        case 'get-issue':
          if (!args.repoSlug || !args.issueId) {
            console.error('ERROR: "repoSlug" and "issueId" parameters are required');
            this.rl.prompt();
            return;
          }
          result = await getIssue(profile, args.workspace, args.repoSlug, args.issueId, format);
          break;

        case 'create-issue':
          if (!args.repoSlug || !args.title) {
            console.error('ERROR: "repoSlug" and "title" parameters are required');
            this.rl.prompt();
            return;
          }
          result = await createIssue(
            profile,
            args.workspace,
            args.repoSlug,
            args.title,
            args.content,
            args.kind,
            args.priority,
            format
          );
          break;

        case 'list-pipelines':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await listPipelines(profile, args.workspace, args.repoSlug, format);
          break;

        case 'get-user':
          result = await getUser(profile, args.username, format);
          break;

        case 'test-connection':
          result = await testConnection(profile);
          break;

        default:
          console.error(`Unknown command: ${command}. Type "commands" to see available commands.`);
          this.rl.prompt();
          return;
      }

      // Display result
      if (result.success) {
        console.log('\n' + result.result);
      } else {
        console.error('\n' + result.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error running command:', errorMessage);
    }

    this.rl.prompt();
  }

  /**
   * Prints help message
   */
  private printHelp(): void {
    const version = getCurrentVersion();
    const currentProfile = this.currentProfile || 'none';
    const currentFormat = this.currentFormat;
    const commandList = COMMANDS.join(', ');

    console.log(`
Bitbucket CLI v${version}

Current Settings:
  Profile: ${currentProfile}
  Format:  ${currentFormat}

Usage:

commands              list all available Bitbucket commands
<command> -h          quick help on <command>
<command> <arg>       run <command> with JSON argument
profile <name>        switch to a different Bitbucket profile
profiles              list all available profiles
format <type>         set output format (json, toon)
clear                 clear the screen
exit, quit, q         exit the CLI

All commands:

${commandList}

Examples:
  list-repositories {"workspace":"myworkspace"}
  get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}
  list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}
  get-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123}
  create-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}
  test-connection

`);
  }

  /**
   * Starts the interactive REPL loop
   */
  async start(): Promise<void> {
    this.rl.prompt();

    this.rl.on('line', async line => {
      await this.handleCommand(line);
    });

    this.rl.on('close', async () => {
      clearClients();
      process.exit(0);
    });

    const gracefulShutdown = async () => {
      try {
        await this.disconnect();
      } catch (error) {
        console.error('Error during shutdown:', error);
      } finally {
        process.exit(0);
      }
    };

    ['SIGINT', 'SIGTERM'].forEach(sig => {
      process.on(sig, () => {
        gracefulShutdown();
      });
    });
  }

  /**
   * Disconnects from Bitbucket and closes the CLI
   */
  private async disconnect(): Promise<void> {
    console.log('\nClosing Bitbucket connections...');
    clearClients();
    this.rl.close();
  }
}
