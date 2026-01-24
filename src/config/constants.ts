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
- workspace (required): string - Workspace ID or slug
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
list-repositories '{"workspace":"myworkspace","profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
get-repository '{"workspace":"myworkspace","repoSlug":"my-repo","profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- state (optional): string - Pull request state (OPEN, MERGED, DECLINED, SUPERSEDED)
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
list-pullrequests '{"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN","profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- pullRequestId (required): number - Pull request ID
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
get-pullrequest '{"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123,"profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- title (required): string - Pull request title
- sourceBranch (required): string - Source branch name
- destinationBranch (required): string - Destination branch name (default: main or master)
- description (optional): string - Pull request description
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
create-pullrequest '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main","profile":"cloud","format":"json"}'`,
  String.raw`
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- q (optional): string - Query string to filter branches using comparison operators (=, !=, ~, !~, >, >=, <, <=, IN, NOT IN). Example: 'name~"feature"' for case-insensitive contains, or 'name="main"' for exact match
- sort (optional): string - Field to sort by. Prefix with '-' for descending order (e.g., '-target.date'). Only one sort field is supported per request
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
list-branches '{"workspace":"myworkspace","repoSlug":"my-repo","q":"name~\"feature\"","sort":"-target.date","profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- branch (optional): string - Branch name to filter commits
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
list-commits '{"workspace":"myworkspace","repoSlug":"my-repo","branch":"main","profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
list-issues '{"workspace":"myworkspace","repoSlug":"my-repo","profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- issueId (required): number - Issue ID
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
get-issue '{"workspace":"myworkspace","repoSlug":"my-repo","issueId":123,"profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- title (required): string - Issue title
- content (optional): string - Issue content/description
- kind (optional): string - Issue type (bug, enhancement, proposal, task)
- priority (optional): string - Issue priority (trivial, minor, major, critical, blocker)
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
create-issue '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found","content":"Description here","kind":"bug","profile":"cloud","format":"json"}'`,
  `
Parameters:
- workspace (required): string - Workspace ID or slug
- repoSlug (required): string - Repository slug
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
list-pipelines '{"workspace":"myworkspace","repoSlug":"my-repo","profile":"cloud","format":"json"}'`,
  `
Parameters:
- username (optional): string - Username to search for
- profile (optional): string - Bitbucket profile name (default: configured default profile)
- format (optional): string - Output format: json or toon (default: json)

Example:
get-user '{"username":"myusername","profile":"cloud","format":"json"}'`,
  `
Parameters:
- profile (optional): string - Bitbucket profile name (default: configured default profile)

Example:
test-connection '{"profile":"cloud"}'`,
];
