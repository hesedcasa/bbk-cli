/**
 * Bitbucket API client wrapper functions
 */
import type { ApiResult } from './bitbucket-utils.js';
import { BitbucketUtil } from './bitbucket-utils.js';
import { loadConfig } from './config-loader.js';

const projectRoot = process.env.CLAUDE_PROJECT_ROOT || process.cwd();

let bitbucketUtil: BitbucketUtil | null = null;

/**
 * Initialize Bitbucket utility
 */
async function initBitbucket(): Promise<BitbucketUtil> {
  if (bitbucketUtil) return bitbucketUtil;

  try {
    const config = loadConfig(projectRoot);
    bitbucketUtil = new BitbucketUtil(config);
    return bitbucketUtil;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initialize Bitbucket client: ${errorMessage}`);
  }
}

/**
 * List all repositories in a workspace
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param format - Output format (json, toon)
 */
export async function listRepositories(
  profile: string,
  workspace?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listRepositories(profile, workspace, format);
}

/**
 * Get repository details
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param format - Output format (json, toon)
 */
export async function getRepository(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.getRepository(profile, workspace, repoSlug, format);
}

/**
 * List pull requests in a repository
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param state - Pull request state (optional)
 * @param format - Output format (json, toon)
 */
export async function listPullRequests(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  state?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listPullRequests(profile, workspace, repoSlug, state, format);
}

/**
 * Get pull request details
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param pullRequestId - Pull request ID
 * @param format - Output format (json, toon)
 */
export async function getPullRequest(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  pullRequestId: number,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.getPullRequest(profile, workspace, repoSlug, pullRequestId, format);
}

/**
 * Create a new pull request
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param title - Pull request title
 * @param sourceBranch - Source branch name
 * @param destinationBranch - Destination branch name
 * @param description - Pull request description (optional)
 * @param format - Output format (json, toon)
 */
export async function createPullRequest(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  title: string,
  sourceBranch: string,
  destinationBranch: string,
  description?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.createPullRequest(
    profile,
    workspace,
    repoSlug,
    title,
    sourceBranch,
    destinationBranch,
    description,
    format
  );
}

/**
 * List branches in a repository
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param q - Query string to filter branches
 * @param sort - Sort field
 * @param format - Output format (json, toon)
 */
export async function listBranches(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  q?: string,
  sort?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listBranches(profile, workspace, repoSlug, q, sort, format);
}

/**
 * List commits in a repository
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param branch - Branch name (optional)
 * @param format - Output format (json, toon)
 */
export async function listCommits(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  branch?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listCommits(profile, workspace, repoSlug, branch, format);
}

/**
 * List issues in a repository
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param format - Output format (json, toon)
 */
export async function listIssues(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listIssues(profile, workspace, repoSlug, format);
}

/**
 * Get issue details
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param issueId - Issue ID
 * @param format - Output format (json, toon)
 */
export async function getIssue(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  issueId: number,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.getIssue(profile, workspace, repoSlug, issueId, format);
}

/**
 * Create a new issue
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param title - Issue title
 * @param content - Issue content/description (optional)
 * @param kind - Issue type (bug, enhancement, proposal, task)
 * @param priority - Issue priority (trivial, minor, major, critical, blocker)
 * @param format - Output format (json, toon)
 */
export async function createIssue(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  title: string,
  content?: string,
  kind?: string,
  priority?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.createIssue(profile, workspace, repoSlug, title, content, kind, priority, format);
}

/**
 * List pipelines in a repository
 * @param profile - Bitbucket profile name
 * @param workspace - Workspace ID or slug (optional, uses profile default if not provided)
 * @param repoSlug - Repository slug
 * @param format - Output format (json, toon)
 */
export async function listPipelines(
  profile: string,
  workspace: string | undefined,
  repoSlug: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listPipelines(profile, workspace, repoSlug, format);
}

/**
 * Get user information
 * @param profile - Bitbucket profile name
 * @param userId - User UUID or account_id (optional, if not provided returns current authenticated user)
 * @param format - Output format (json, toon)
 */
export async function getUser(profile: string, userId?: string, format: 'json' | 'toon' = 'json'): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.getUser(profile, userId, format);
}

/**
 * Test Bitbucket API connection
 * @param profile - Bitbucket profile name
 */
export async function testConnection(profile: string): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.testConnection(profile);
}

/**
 * Clear Bitbucket client pool (for cleanup)
 */
export function clearClients(): void {
  if (bitbucketUtil) {
    bitbucketUtil.clearClients();
    bitbucketUtil = null;
  }
}
