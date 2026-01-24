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
    // Load config to get default profile
    const projectRoot = process.env.CLAUDE_PROJECT_ROOT || process.cwd();
    const config = loadConfig(projectRoot);

    // Parse arguments
    const args = arg && arg.trim() !== '' ? JSON.parse(arg) : {};
    const profile = args.profile || config.defaultProfile;
    const format = args.format || config.defaultFormat;

    let result;

    switch (command) {
      case 'list-repositories':
        if (!args.workspace) {
          console.error('ERROR: "workspace" parameter is required');
          process.exit(1);
        }
        result = await listRepositories(profile, args.workspace, format);
        break;

      case 'get-repository':
        if (!args.workspace || !args.repoSlug) {
          console.error('ERROR: "workspace" and "repoSlug" parameters are required');
          process.exit(1);
        }
        result = await getRepository(profile, args.workspace, args.repoSlug, format);
        break;

      case 'list-pullrequests':
        if (!args.workspace || !args.repoSlug) {
          console.error('ERROR: "workspace" and "repoSlug" parameters are required');
          process.exit(1);
        }
        result = await listPullRequests(profile, args.workspace, args.repoSlug, args.state, format);
        break;

      case 'get-pullrequest':
        if (!args.workspace || !args.repoSlug || !args.pullRequestId) {
          console.error('ERROR: "workspace", "repoSlug", and "pullRequestId" parameters are required');
          process.exit(1);
        }
        result = await getPullRequest(profile, args.workspace, args.repoSlug, args.pullRequestId, format);
        break;

      case 'create-pullrequest':
        if (!args.workspace || !args.repoSlug || !args.title || !args.sourceBranch || !args.destinationBranch) {
          console.error(
            'ERROR: "workspace", "repoSlug", "title", "sourceBranch", and "destinationBranch" parameters are required'
          );
          process.exit(1);
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
        if (!args.workspace || !args.repoSlug) {
          console.error('ERROR: "workspace" and "repoSlug" parameters are required');
          process.exit(1);
        }
        result = await listBranches(profile, args.workspace, args.repoSlug, args.q, args.sort, format);
        break;

      case 'list-commits':
        if (!args.workspace || !args.repoSlug) {
          console.error('ERROR: "workspace" and "repoSlug" parameters are required');
          process.exit(1);
        }
        result = await listCommits(profile, args.workspace, args.repoSlug, args.branch, format);
        break;

      case 'list-issues':
        if (!args.workspace || !args.repoSlug) {
          console.error('ERROR: "workspace" and "repoSlug" parameters are required');
          process.exit(1);
        }
        result = await listIssues(profile, args.workspace, args.repoSlug, format);
        break;

      case 'get-issue':
        if (!args.workspace || !args.repoSlug || !args.issueId) {
          console.error('ERROR: "workspace", "repoSlug", and "issueId" parameters are required');
          process.exit(1);
        }
        result = await getIssue(profile, args.workspace, args.repoSlug, args.issueId, format);
        break;

      case 'create-issue':
        if (!args.workspace || !args.repoSlug || !args.title) {
          console.error('ERROR: "workspace", "repoSlug", and "title" parameters are required');
          process.exit(1);
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
        if (!args.workspace || !args.repoSlug) {
          console.error('ERROR: "workspace" and "repoSlug" parameters are required');
          process.exit(1);
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
