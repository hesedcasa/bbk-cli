/**
 * Bitbucket API client wrapper functions
 */
import type { ApiResult } from './bitbucket-utils.js';
import { BitbucketUtil } from './bitbucket-utils.js';
import { loadConfig } from './config-loader.js';

let bitbucketUtil: BitbucketUtil | null = null;

/**
 * Initialize Bitbucket utility
 */
async function initBitbucket(): Promise<BitbucketUtil> {
  if (bitbucketUtil) return bitbucketUtil;

  try {
    const config = loadConfig();
    bitbucketUtil = new BitbucketUtil(config);
    return bitbucketUtil;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initialize Bitbucket client: ${errorMessage}`);
  }
}

/**
 * List all repositories in a workspace
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param format - Output format (json, toon)
 */
export async function listRepositories(workspace?: string, format: 'json' | 'toon' = 'json'): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listRepositories(workspace, format);
}

/**
 * Get repository details
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param format - Output format (json, toon)
 */
export async function getRepository(
  workspace: string | undefined,
  repoSlug: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.getRepository(workspace, repoSlug, format);
}

/**
 * List pull requests in a repository
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param state - Pull request state (optional)
 * @param format - Output format (json, toon)
 */
export async function listPullRequests(
  workspace: string | undefined,
  repoSlug: string,
  state?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listPullRequests(workspace, repoSlug, state, format);
}

/**
 * Get pull request details
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param pullRequestId - Pull request ID
 * @param format - Output format (json, toon)
 */
export async function getPullRequest(
  workspace: string | undefined,
  repoSlug: string,
  pullRequestId: number,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.getPullRequest(workspace, repoSlug, pullRequestId, format);
}

/**
 * Create a new pull request
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param title - Pull request title
 * @param sourceBranch - Source branch name
 * @param destinationBranch - Destination branch name
 * @param description - Pull request description (optional)
 * @param format - Output format (json, toon)
 */
export async function createPullRequest(
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
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param q - Query string to filter branches
 * @param sort - Sort field
 * @param format - Output format (json, toon)
 */
export async function listBranches(
  workspace: string | undefined,
  repoSlug: string,
  q?: string,
  sort?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listBranches(workspace, repoSlug, q, sort, format);
}

/**
 * List commits in a repository
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param branch - Branch name (optional)
 * @param format - Output format (json, toon)
 */
export async function listCommits(
  workspace: string | undefined,
  repoSlug: string,
  branch?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listCommits(workspace, repoSlug, branch, format);
}

/**
 * List issues in a repository
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param format - Output format (json, toon)
 */
export async function listIssues(
  workspace: string | undefined,
  repoSlug: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listIssues(workspace, repoSlug, format);
}

/**
 * Get issue details
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param issueId - Issue ID
 * @param format - Output format (json, toon)
 */
export async function getIssue(
  workspace: string | undefined,
  repoSlug: string,
  issueId: number,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.getIssue(workspace, repoSlug, issueId, format);
}

/**
 * Create a new issue
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param title - Issue title
 * @param content - Issue content/description (optional)
 * @param kind - Issue type (bug, enhancement, proposal, task)
 * @param priority - Issue priority (trivial, minor, major, critical, blocker)
 * @param format - Output format (json, toon)
 */
export async function createIssue(
  workspace: string | undefined,
  repoSlug: string,
  title: string,
  content?: string,
  kind?: string,
  priority?: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.createIssue(workspace, repoSlug, title, content, kind, priority, format);
}

/**
 * List pipelines in a repository
 * @param workspace - Workspace ID or slug (optional, uses default if not provided)
 * @param repoSlug - Repository slug
 * @param format - Output format (json, toon)
 */
export async function listPipelines(
  workspace: string | undefined,
  repoSlug: string,
  format: 'json' | 'toon' = 'json'
): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.listPipelines(workspace, repoSlug, format);
}

/**
 * Get user information
 * @param userId - User UUID or account_id (optional, if not provided returns current authenticated user)
 * @param format - Output format (json, toon)
 */
export async function getUser(userId?: string, format: 'json' | 'toon' = 'json'): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.getUser(userId, format);
}

/**
 * Test Bitbucket API connection
 */
export async function testConnection(): Promise<ApiResult> {
  const bitbucket = await initBitbucket();
  return await bitbucket.testConnection();
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
