# Bitbucket CLI

[![npm bbk-cli package](https://img.shields.io/npm/v/bbk-cli.svg)](https://npmjs.org/package/bbk-cli)

A powerful command-line interface for Bitbucket interaction with support for repositories, pull requests, issues, branches, commits, and pipelines.

## Features

- 💻 **Interactive REPL** for Bitbucket exploration and management
- 🚀 **Headless mode** for one-off command execution and automation
- 🏢 **Default workspace support** - omit workspace parameter when configured
- 📊 **Multiple output formats**: JSON or TOON
- 📦 **Repository management**: list and view repository details
- 🔀 **Pull request operations**: list, view, and create pull requests with auto-reviewers
- 🐛 **Issue tracking**: list, view, and create issues
- 🌿 **Branch operations**: list branches in repositories
- 📝 **Commit history**: view commits in repositories
- 🔧 **Pipeline support**: list pipeline runs
- 👤 **User management**: retrieve user information
- ✅ **Connection testing** for quick diagnostics

## Requirements

- [Node.js](https://nodejs.org/) v22.0 or newer
- [npm](https://www.npmjs.com/)
- Bitbucket Cloud account with API access

## Installation

```bash
npm install -g bbk-cli
```

## Configuration

### Step 1: Create API Token

1. Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label (e.g., "BBK CLI")
4. Copy the generated token

### Step 2: Create Configuration File

Create a configuration file at `~/.bbkcli` in your home directory:

```ini
[auth]
email=your-email@example.com
api_token=YOUR_API_TOKEN_HERE

[defaults]
workspace=myworkspace
format=json
```

### Configuration Options

- **[auth] section** - Required authentication credentials
  - `email`: Your Bitbucket email
  - `api_token`: Your Bitbucket API token (App Password)

- **[defaults] section** - Optional default settings
  - `workspace`: Default workspace to use if not specified in commands
  - `format`: Default output format (`json` or `toon`)

## Quick Start

### Interactive Mode

Start the CLI and interact with Bitbucket through a REPL:

```bash
bbk-cli
```

Once started, you'll see the `bbk>` prompt:

```
bbk> list-repositories {"workspace":"myworkspace"}
bbk> list-repositories {}              # Uses default workspace from config
bbk> get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}
bbk> get-repository {"repoSlug":"my-repo"}  # Uses default workspace from config
bbk> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}
bbk> list-pullrequests {"repoSlug":"my-repo","state":"OPEN"}  # Uses default workspace
```

### Headless Mode

Execute single commands directly:

```bash
# Test connection
bbk-cli test-connection

# List all repositories
bbk-cli list-repositories '{"workspace":"myworkspace"}'

# Get repository details
bbk-cli get-repository '{"workspace":"myworkspace","repoSlug":"my-repo"}'

# List pull requests
bbk-cli list-pullrequests '{"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}'

# Get pull request details
bbk-cli get-pullrequest '{"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123}'

# Create a new pull request
bbk-cli create-pullrequest '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}'

# List issues
bbk-cli list-issues '{"workspace":"myworkspace","repoSlug":"my-repo"}'

# Create an issue
bbk-cli create-issue '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found","kind":"bug"}'
```

## Available Commands

### Repository Commands

- **list-repositories** - List all repositories in a workspace

  ```bash
  bbk> list-repositories {"workspace":"myworkspace"}
  bbk> list-repositories {"workspace":"myworkspace","format":"json"}
  ```

- **get-repository** - Get details of a specific repository
  ```bash
  bbk> get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}
  ```

### Pull Request Commands

- **list-pullrequests** - List pull requests in a repository

  ```bash
  bbk> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo"}
  bbk> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}
  ```

- **get-pullrequest** - Get details of a specific pull request

  ```bash
  bbk> get-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123}
  ```

- **create-pullrequest** - Create a new pull request

  ```bash
  bbk> create-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}
  bbk> create-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main","description":"PR description"}
  ```

  **Note**: This command automatically adds the repository's default reviewers (excluding the PR author) to the pull request.

### Branch Commands

- **list-branches** - List branches in a repository

  ```bash
  bbk> list-branches {"workspace":"myworkspace","repoSlug":"my-repo"}
  ```

### Commit Commands

- **list-commits** - List commits in a repository

  ```bash
  bbk> list-commits {"workspace":"myworkspace","repoSlug":"my-repo"}
  bbk> list-commits {"workspace":"myworkspace","repoSlug":"my-repo","branch":"main"}
  ```

### Issue Commands

- **list-issues** - List issues in a repository

  ```bash
  bbk> list-issues {"workspace":"myworkspace","repoSlug":"my-repo"}
  ```

- **get-issue** - Get details of a specific issue

  ```bash
  bbk> get-issue {"workspace":"myworkspace","repoSlug":"my-repo","issueId":123}
  ```

- **create-issue** - Create a new issue

  ```bash
  bbk> create-issue {"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found"}
  bbk> create-issue {"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found","content":"Description here","kind":"bug","priority":"major"}
  ```

### Pipeline Commands

- **list-pipelines** - List pipelines in a repository

  ```bash
  bbk> list-pipelines {"workspace":"myworkspace","repoSlug":"my-repo"}
  ```

### User Commands

- **get-user** - Get user information
  ```bash
  bbk> get-user {}                         # Get current authenticated user
  bbk> get-user {"userId":"04b587de-b844-4c54-b4ec-1e33157fcc15"}  # Get specific user by UUID
  ```

### Utility Commands

- **test-connection** - Test Bitbucket API connection
  ```bash
  bbk> test-connection
  ```

## Interactive Mode Commands

Special commands available in the REPL:

- **commands** - List all available commands
- **help** or **?** - Show help message
- **format \<type\>** - Set output format (json, toon)
- **clear** - Clear the screen
- **exit**, **quit**, or **q** - Exit the CLI

## Output Formats

### JSON Format

Machine-readable JSON format (default):

```bash
bbk> format json
bbk> list-repositories {"workspace":"myworkspace"}
```

### TOON Format

[Token-Oriented Object Notation](https://github.com/toon-format/toon) for AI-optimized output:

```bash
bbk> format toon
bbk> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo"}
```

## Security

⚠️ **Important Security Notes:**

1. **Never commit** `~/.bbkcli` to version control
2. The config file is created with secure permissions (0600 - read/write for owner only)
3. Keep your API tokens secure and rotate them periodically
4. API tokens have the same permissions as your user account

## Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/hesedcasa/bbk-cli.git
cd bbk-cli

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm start
```

### Run Tests

```bash
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
```

### Code Quality

```bash
npm run format              # Format code with ESLint and Prettier
npm run find-deadcode       # Find unused exports
npm run pre-commit          # Run format + find-deadcode
```

## Examples

### Basic Workflow

```bash
# Start interactive mode
bbk-cli

# List all repositories in workspace
bbk> list-repositories {"workspace":"myworkspace"}

# Get specific repository
bbk> get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}

# List pull requests
bbk> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}

# Get specific pull request
bbk> get-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123}

# Create new pull request
bbk> create-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}

# List branches
bbk> list-branches {"workspace":"myworkspace","repoSlug":"my-repo"}

# List commits
bbk> list-commits {"workspace":"myworkspace","repoSlug":"my-repo","branch":"main"}

# List issues
bbk> list-issues {"workspace":"myworkspace","repoSlug":"my-repo"}

# Create issue
bbk> create-issue {"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found","kind":"bug"}
```

## Troubleshooting

### Connection Issues

```bash
# Test your connection
bbk-cli test-connection

# Common issues:
# 1. Invalid API token - regenerate credentials
# 2. Wrong email - use your Bitbucket account email
```

### Authentication Errors

- Verify your API token is correct
- Check that the email matches your Bitbucket account

### Permission Errors

- API token inherits your user permissions
- Check that your Bitbucket account has access to the workspace/repository
- Some operations require specific repository permissions
- Pull request creation requires write access to the repository

## License

Apache-2.0
