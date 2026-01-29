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
      this.config = loadConfig();
      this.currentFormat = this.config.defaultFormat;

      this.printHelp();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to load configuration:', errorMessage);
      console.error('\nTo fix this issue:');
      console.error('  Run: bbk-cli config');
      console.error('  This will start the interactive configuration setup.');
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
    if (!this.config) {
      console.log('Configuration not loaded!');
      this.rl.prompt();
      return;
    }

    try {
      // Parse arguments
      const args = arg && arg.trim() !== '' ? JSON.parse(arg) : {};
      const format = args.format || this.currentFormat;

      let result;

      switch (command) {
        case 'list-repositories':
          result = await listRepositories(args.workspace, format);
          break;

        case 'get-repository':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await getRepository(args.workspace, args.repoSlug, format);
          break;

        case 'list-pullrequests':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await listPullRequests(args.workspace, args.repoSlug, args.state, format);
          break;

        case 'get-pullrequest':
          if (!args.repoSlug || !args.pullRequestId) {
            console.error('ERROR: "repoSlug" and "pullRequestId" parameters are required');
            this.rl.prompt();
            return;
          }
          result = await getPullRequest(args.workspace, args.repoSlug, args.pullRequestId, format);
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
          result = await listBranches(args.workspace, args.repoSlug, args.q, args.sort, format);
          break;

        case 'list-commits':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await listCommits(args.workspace, args.repoSlug, args.branch, format);
          break;

        case 'list-issues':
          if (!args.repoSlug) {
            console.error('ERROR: "repoSlug" parameter is required');
            this.rl.prompt();
            return;
          }
          result = await listIssues(args.workspace, args.repoSlug, format);
          break;

        case 'get-issue':
          if (!args.repoSlug || !args.issueId) {
            console.error('ERROR: "repoSlug" and "issueId" parameters are required');
            this.rl.prompt();
            return;
          }
          result = await getIssue(args.workspace, args.repoSlug, args.issueId, format);
          break;

        case 'create-issue':
          if (!args.repoSlug || !args.title) {
            console.error('ERROR: "repoSlug" and "title" parameters are required');
            this.rl.prompt();
            return;
          }
          result = await createIssue(
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
          result = await listPipelines(args.workspace, args.repoSlug, format);
          break;

        case 'get-user':
          result = await getUser(args.userId, format);
          break;

        case 'test-connection':
          result = await testConnection();
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
    const currentFormat = this.currentFormat;
    const commandList = COMMANDS.join(', ');

    console.log(`
Bitbucket CLI v${version}

Current Settings:
  Format:  ${currentFormat}

Usage:

commands              list all available Bitbucket commands
<command> -h          quick help on <command>
<command> <arg>       run <command> with JSON argument
format <type>         set output format (json, toon)
clear                 clear the screen
exit, quit, q         exit the CLI

All commands:

${commandList}

Examples:
  list-repositories
  list-pullrequests {"repoSlug":"my-repo","state":"OPEN"}
  get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}
  get-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123}
  create-pullrequest {"repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}
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
