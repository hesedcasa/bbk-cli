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
  setupConfig,
  testConnection,
} from '../utils/index.js';

/**
 * Execute a Bitbucket command in headless mode
 * @param command - The command name to execute
 * @param arg - JSON string or null for the command arguments
 */
export const runCommand = async (
  command: string,
  arg: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _flag: string | null
): Promise<void> => {
  try {
    // Handle config command first (before loading config)
    if (command === 'config') {
      await setupConfig();
      clearClients();
      process.exit(0);
    }

    // Load config
    const config = loadConfig();

    // Parse arguments
    const args = arg && arg.trim() !== '' ? JSON.parse(arg) : {};
    const format = args.format || config.defaultFormat;

    let result;

    switch (command) {
      case 'list-repositories':
        result = await listRepositories(args.workspace, format);
        break;

      case 'get-repository':
        if (!args.repoSlug) {
          console.error('ERROR: "repoSlug" parameter is required');
          process.exit(1);
        }
        result = await getRepository(args.workspace, args.repoSlug, format);
        break;

      case 'list-pullrequests':
        if (!args.repoSlug) {
          console.error('ERROR: "repoSlug" parameter is required');
          process.exit(1);
        }
        result = await listPullRequests(args.workspace, args.repoSlug, args.state, format);
        break;

      case 'get-pullrequest':
        if (!args.repoSlug || !args.pullRequestId) {
          console.error('ERROR: "repoSlug" and "pullRequestId" parameters are required');
          process.exit(1);
        }
        result = await getPullRequest(args.workspace, args.repoSlug, args.pullRequestId, format);
        break;

      case 'create-pullrequest':
        if (!args.repoSlug || !args.title || !args.sourceBranch || !args.destinationBranch) {
          console.error('ERROR: "repoSlug", "title", "sourceBranch", and "destinationBranch" parameters are required');
          process.exit(1);
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
          process.exit(1);
        }
        result = await listBranches(args.workspace, args.repoSlug, args.q, args.sort, format);
        break;

      case 'list-commits':
        if (!args.repoSlug) {
          console.error('ERROR: "repoSlug" parameter is required');
          process.exit(1);
        }
        result = await listCommits(args.workspace, args.repoSlug, args.branch, format);
        break;

      case 'list-issues':
        if (!args.repoSlug) {
          console.error('ERROR: "repoSlug" parameter is required');
          process.exit(1);
        }
        result = await listIssues(args.workspace, args.repoSlug, format);
        break;

      case 'get-issue':
        if (!args.repoSlug || !args.issueId) {
          console.error('ERROR: "repoSlug" and "issueId" parameters are required');
          process.exit(1);
        }
        result = await getIssue(args.workspace, args.repoSlug, args.issueId, format);
        break;

      case 'create-issue':
        if (!args.repoSlug || !args.title) {
          console.error('ERROR: "repoSlug" and "title" parameters are required');
          process.exit(1);
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
          process.exit(1);
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
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }

    // Display result
    if (result.success) {
      console.log(result.result);
      clearClients();
      process.exit(0);
    } else {
      console.error(result.error);
      clearClients();
      process.exit(1);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error executing command:', errorMessage);
    clearClients();
    process.exit(1);
  }
};
