import { encode } from '@toon-format/toon';

import type { Config } from './config-loader.js';
import { getBitbucketClientOptions } from './config-loader.js';

const BITBUCKET_API_BASE = 'https://api.bitbucket.org/2.0';

/**
 * Generic API result
 */
export interface ApiResult {
  success: boolean;
  result?: string;
  data?: unknown;
  error?: string;
}

/**
 * Bitbucket API client options
 */
interface BitbucketClientAuth {
  username: string;
  password: string; // App password or token
}

/**
 * Bitbucket API Utility Module
 * Provides core Bitbucket API operations with formatting using basic auth
 */
export class BitbucketUtil {
  private readonly config: Config;
  private readonly authPool: Map<string, BitbucketClientAuth>;

  constructor(config: Config) {
    this.config = config;
    this.authPool = new Map();
  }

  /**
   * Get authentication for a profile
   */
  getAuth(profileName: string): BitbucketClientAuth {
    if (this.authPool.has(profileName)) {
      return this.authPool.get(profileName)!;
    }

    const options = getBitbucketClientOptions(this.config, profileName);

    if (!options.auth?.username || !options.auth?.password) {
      throw new Error(`Invalid authentication for profile "${profileName}"`);
    }

    const auth: BitbucketClientAuth = {
      username: options.auth.username,
      password: options.auth.password,
    };

    this.authPool.set(profileName, auth);
    return auth;
  }

  /**
   * Make authenticated request to Bitbucket API
   */
  private async makeRequest(
    profileName: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<unknown> {
    const auth = this.getAuth(profileName);
    const url = `${BITBUCKET_API_BASE}${endpoint}`;

    // Create Basic Auth header
    const authString = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');

    const headers: Record<string, string> = {
      Authorization: `Basic ${authString}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bitbucket API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Format data as JSON
   */
  formatAsJson(data: unknown): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Format data as TOON (Token-Oriented Object Notation)
   */
  formatAsToon(data: unknown): string {
    if (!data) {
      return '';
    }

    return encode(data);
  }

  /**
   * Format result with specified format
   */
  formatResult(data: unknown, format: 'json' | 'toon' = 'json'): string {
    if (format === 'toon') {
      return this.formatAsToon(data);
    }
    return this.formatAsJson(data);
  }

  /**
   * List all repositories in a workspace
   */
  async listRepositories(profileName: string, workspace: string, format: 'json' | 'toon' = 'json'): Promise<ApiResult> {
    try {
      const response = await this.makeRequest(profileName, `/repositories/${workspace}`);

      // Simplify repository data for display
      const repos = response.values || [];
      const simplifiedRepos = repos.map((r: unknown) => ({
        slug: r.slug,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        is_private: r.is_private,
        created_on: r.created_on,
        updated_on: r.updated_on,
      }));

      return {
        success: true,
        data: simplifiedRepos,
        result: this.formatResult(simplifiedRepos, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * Get repository details
   */
  async getRepository(
    profileName: string,
    workspace: string,
    repoSlug: string,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      const response = await this.makeRequest(profileName, `/repositories/${workspace}/${repoSlug}`);

      return {
        success: true,
        data: response,
        result: this.formatResult(response, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * List pull requests in a repository
   */
  async listPullRequests(
    profileName: string,
    workspace: string,
    repoSlug: string,
    state?: string,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      let endpoint = `/repositories/${workspace}/${repoSlug}/pullrequests`;

      if (state) {
        endpoint += `?state=${state}`;
      }

      const response = await this.makeRequest(profileName, endpoint);
      const prs = response.values || [];

      // Simplify PR data for display
      const simplifiedPRs = prs.map((pr: unknown) => ({
        id: pr.id,
        title: pr.title,
        state: pr.state,
        author: pr.author?.display_name || pr.author?.nickname,
        source_branch: pr.source?.branch?.name,
        destination_branch: pr.destination?.branch?.name,
        created_on: pr.created_on,
        updated_on: pr.updated_on,
      }));

      return {
        success: true,
        data: simplifiedPRs,
        result: this.formatResult(simplifiedPRs, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * Get pull request details
   */
  async getPullRequest(
    profileName: string,
    workspace: string,
    repoSlug: string,
    pullRequestId: number,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      const response = await this.makeRequest(
        profileName,
        `/repositories/${workspace}/${repoSlug}/pullrequests/${pullRequestId}`
      );

      return {
        success: true,
        data: response,
        result: this.formatResult(response, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * Get default reviewers for a repository
   */
  async getDefaultReviewers(profileName: string, workspace: string, repoSlug: string): Promise<unknown[]> {
    try {
      const response = await this.makeRequest(
        profileName,
        `/repositories/${workspace}/${repoSlug}/effective-default-reviewers`
      );

      // Extract user UUIDs from the response
      const reviewers = response.values || [];
      return reviewers.map((reviewer: unknown) => ({
        uuid:
          (reviewer as { user?: { uuid?: string }; uuid?: string }).user?.uuid || (reviewer as { uuid?: string }).uuid,
      }));
    } catch {
      // Return empty array if fetching reviewers fails
      return [];
    }
  }

  /**
   * Create a new pull request
   */
  async createPullRequest(
    profileName: string,
    workspace: string,
    repoSlug: string,
    title: string,
    sourceBranch: string,
    destinationBranch: string,
    description?: string,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      // Fetch the current authenticated user and default reviewers in parallel
      const [currentUserResponse, defaultReviewers] = await Promise.all([
        this.makeRequest(profileName, '/user'),
        this.getDefaultReviewers(profileName, workspace, repoSlug),
      ]);

      const currentUserUuid = currentUserResponse.uuid;

      // Filter out the current user from reviewers (author cannot be a reviewer)
      const filteredReviewers = defaultReviewers.filter(reviewer => reviewer.uuid !== currentUserUuid);

      const body: Record<string, unknown> = {
        type: 'pullrequest',
        title,
        source: {
          branch: {
            name: sourceBranch,
          },
        },
        destination: {
          branch: {
            name: destinationBranch,
          },
        },
        description: description || '',
      };

      // Add reviewers if any were found (excluding the author)
      if (filteredReviewers.length > 0) {
        body.reviewers = filteredReviewers;
      }

      const response = await this.makeRequest(
        profileName,
        `/repositories/${workspace}/${repoSlug}/pullrequests`,
        'POST',
        body
      );

      return {
        success: true,
        data: response,
        result: this.formatResult(response, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * List branches in a repository
   */
  async listBranches(
    profileName: string,
    workspace: string,
    repoSlug: string,
    q?: string,
    sort?: string,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      let endpoint = `/repositories/${workspace}/${repoSlug}/refs/branches`;

      const params: string[] = [];
      if (q && q.trim() !== '') {
        params.push(`q=${encodeURIComponent(q)}`);
      }
      if (sort && sort.trim() !== '') {
        params.push(`sort=${encodeURIComponent(sort)}`);
      }

      if (params.length > 0) {
        endpoint += `?${params.join('&')}`;
      }

      const response = await this.makeRequest(profileName, endpoint);

      const branches = response.values || [];
      const simplifiedBranches = branches.map((b: unknown) => ({
        name: b.name,
        target: {
          hash: b.target?.hash,
          date: b.target?.date,
          message: b.target?.message,
        },
      }));

      return {
        success: true,
        data: simplifiedBranches,
        result: this.formatResult(simplifiedBranches, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * List commits in a repository
   */
  async listCommits(
    profileName: string,
    workspace: string,
    repoSlug: string,
    branch?: string,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      let endpoint = `/repositories/${workspace}/${repoSlug}/commits`;

      if (branch) {
        endpoint += `/${branch}`;
      }

      const response = await this.makeRequest(profileName, endpoint);
      const commits = response.values || [];

      const simplifiedCommits = commits.map((c: unknown) => ({
        hash: c.hash,
        date: c.date,
        message: c.message,
        author: c.author?.user?.display_name || c.author?.raw,
      }));

      return {
        success: true,
        data: simplifiedCommits,
        result: this.formatResult(simplifiedCommits, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * List issues in a repository
   */
  async listIssues(
    profileName: string,
    workspace: string,
    repoSlug: string,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      const response = await this.makeRequest(profileName, `/repositories/${workspace}/${repoSlug}/issues`);

      const issues = response.values || [];
      const simplifiedIssues = issues.map((i: unknown) => ({
        id: i.id,
        title: i.title,
        state: i.state,
        kind: i.kind,
        priority: i.priority,
        created_on: i.created_on,
        updated_on: i.updated_on,
      }));

      return {
        success: true,
        data: simplifiedIssues,
        result: this.formatResult(simplifiedIssues, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * Get issue details
   */
  async getIssue(
    profileName: string,
    workspace: string,
    repoSlug: string,
    issueId: number,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      const response = await this.makeRequest(profileName, `/repositories/${workspace}/${repoSlug}/issues/${issueId}`);

      return {
        success: true,
        data: response,
        result: this.formatResult(response, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(
    profileName: string,
    workspace: string,
    repoSlug: string,
    title: string,
    content?: string,
    kind?: string,
    priority?: string,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      const issueData: Record<string, unknown> = { title };

      if (content) {
        issueData.content = { raw: content };
      }
      if (kind) {
        issueData.kind = kind;
      }
      if (priority) {
        issueData.priority = priority;
      }

      const response = await this.makeRequest(
        profileName,
        `/repositories/${workspace}/${repoSlug}/issues`,
        'POST',
        issueData
      );

      return {
        success: true,
        data: response,
        result: this.formatResult(response, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * List pipelines in a repository
   */
  async listPipelines(
    profileName: string,
    workspace: string,
    repoSlug: string,
    format: 'json' | 'toon' = 'json'
  ): Promise<ApiResult> {
    try {
      const response = await this.makeRequest(profileName, `/repositories/${workspace}/${repoSlug}/pipelines/`);

      const pipelines = response.values || [];
      const simplifiedPipelines = pipelines.map((p: unknown) => ({
        uuid: p.uuid,
        build_number: p.build_number,
        state: p.state?.name,
        created_on: p.created_on,
        completed_on: p.completed_on,
        target: p.target?.ref_name,
      }));

      return {
        success: true,
        data: simplifiedPipelines,
        result: this.formatResult(simplifiedPipelines, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * Get user information
   */
  async getUser(profileName: string, username?: string, format: 'json' | 'toon' = 'json'): Promise<ApiResult> {
    try {
      let endpoint: string;

      if (username) {
        endpoint = `/users/${username}`;
      } else {
        // Get current authenticated user
        endpoint = `/user`;
      }

      const response = await this.makeRequest(profileName, endpoint);

      return {
        success: true,
        data: response,
        result: this.formatResult(response, format),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * Test Bitbucket API connection
   */
  async testConnection(profileName: string): Promise<ApiResult> {
    try {
      // Test connection by getting current user
      const response = await this.makeRequest(profileName, '/user');

      return {
        success: true,
        data: { status: 'connected', user: response },
        result: `Connection successful! Authenticated as: ${response.display_name || response.username}`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Connection failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Clear all auth from the pool
   */
  clearClients(): void {
    this.authPool.clear();
  }
}
