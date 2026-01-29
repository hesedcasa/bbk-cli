/**
 * Bitbucket CLI Commands Configuration
 */

/**
 * Available Bitbucket commands
 */
export const COMMANDS: string[] = [
  'list-repositories',
  'get-repository',
  'list-pullrequests',
  'get-pullrequest',
  'create-pullrequest',
  'list-branches',
  'list-commits',
  'list-issues',
  'get-issue',
  'create-issue',
  'list-pipelines',
  'get-user',
  'test-connection',
];

/**
 * Brief descriptions for each command
 */
export const COMMANDS_INFO: string[] = [
  'List all accessible repositories',
  'Get details of a specific repository',
  'List pull requests in a repository',
  'Get details of a specific pull request',
  'Create a new pull request',
  'List branches in a repository',
  'List commits in a repository',
  'List issues in a repository',
  'Get details of a specific issue',
  'Create a new issue',
  'List pipelines in a repository',
  'Get user information',
  'Test Bitbucket API connection',
];

/**
 * Detailed parameter information for each command
 */
export const COMMANDS_DETAIL: string[] = [
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- format (optional): string - Output format: json or toon (default: json)

Example:
list-repositories '{"workspace":"myworkspace","format":"json"}'
list-repositories # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- format (optional): string - Output format: json or toon (default: json)

Example:
get-repository '{"workspace":"myworkspace","repoSlug":"my-repo","format":"json"}'
get-repository '{"repoSlug":"my-repo","format":"json"}'  # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- state (optional): string - Pull request state (OPEN, MERGED, DECLINED, SUPERSEDED)
- format (optional): string - Output format: json or toon (default: json)

Example:
list-pullrequests '{"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN","format":"json"}'
list-pullrequests '{"repoSlug":"my-repo","state":"OPEN","format":"json"}'  # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- pullRequestId (required): number - Pull request ID
- format (optional): string - Output format: json or toon (default: json)

Example:
get-pullrequest '{"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123,"format":"json"}'
get-pullrequest '{"repoSlug":"my-repo","pullRequestId":123,"format":"json"}'  # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- title (required): string - Pull request title
- sourceBranch (required): string - Source branch name
- destinationBranch (required): string - Destination branch name (default: main or master)
- description (optional): string - Pull request description
- format (optional): string - Output format: json or toon (default: json)

Example:
create-pullrequest '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main","format":"json"}'
create-pullrequest '{"repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}'  # Uses default workspace`,
  String.raw`
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- q (optional): string - Query string to filter branches using comparison operators (=, !=, ~, !~, >, >=, <, <=, IN, NOT IN). Example: 'name~"feature"' for case-insensitive contains, or 'name="main"' for exact match
- sort (optional): string - Field to sort by. Prefix with '-' for descending order (e.g., '-target.date'). Only one sort field is supported per request
- format (optional): string - Output format: json or toon (default: json)

Example:
list-branches '{"workspace":"myworkspace","repoSlug":"my-repo","q":"name~\"feature\"","sort":"-target.date","format":"json"}'
list-branches '{"repoSlug":"my-repo"}'  # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- branch (optional): string - Branch name to filter commits
- format (optional): string - Output format: json or toon (default: json)

Example:
list-commits '{"workspace":"myworkspace","repoSlug":"my-repo","branch":"main","format":"json"}'
list-commits '{"repoSlug":"my-repo","branch":"main","format":"json"}'  # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- format (optional): string - Output format: json or toon (default: json)

Example:
list-issues '{"workspace":"myworkspace","repoSlug":"my-repo","format":"json"}'
list-issues '{"repoSlug":"my-repo","format":"json"}'  # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- issueId (required): number - Issue ID
- format (optional): string - Output format: json or toon (default: json)

Example:
get-issue '{"workspace":"myworkspace","repoSlug":"my-repo","issueId":123,"format":"json"}'
get-issue '{"repoSlug":"my-repo","issueId":123,"format":"json"}'  # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- title (required): string - Issue title
- content (optional): string - Issue content/description
- kind (optional): string - Issue type (bug, enhancement, proposal, task)
- priority (optional): string - Issue priority (trivial, minor, major, critical, blocker)
- format (optional): string - Output format: json or toon (default: json)

Example:
create-issue '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found","content":"Description here","kind":"bug","format":"json"}'
create-issue '{"repoSlug":"my-repo","title":"Bug found","kind":"bug"}'  # Uses default workspace`,
  `
Parameters:
- workspace (optional): string - Workspace ID or slug (uses default workspace if not provided)
- repoSlug (required): string - Repository slug
- format (optional): string - Output format: json or toon (default: json)

Example:
list-pipelines '{"workspace":"myworkspace","repoSlug":"my-repo","format":"json"}'
list-pipelines '{"repoSlug":"my-repo","format":"json"}'  # Uses default workspace`,
  `
Parameters:
- userId (optional): string - User UUID or account_id to look up. If not provided, returns current authenticated user.
- format (optional): string - Output format: json or toon (default: json)

Example:
get-user  # Get current authenticated user
get-user '{"userId":"04b587de-b844-4c54-b4ec-1e33157fcc15"}'  # Get specific user by UUID`,
  `
Parameters: None

Example:
test-connection`,
];
