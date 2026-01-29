# Bitbucket CLI

[![npm bbk-cli package](https://img.shields.io/npm/v/bbk-cli.svg)](https://npmjs.org/package/bbk-cli)

A powerful command-line interface for Bitbucket interaction with support for repositories, pull requests, issues, branches, commits, and pipelines.

## Features

- 💻 **Interactive REPL** for Bitbucket exploration and management
- 🚀 **Headless mode** for one-off command execution and automation
- 🏢 **Default workspace support** - set once in config, omit from commands
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

### Recommended: Interactive Setup

The easiest way to configure bbk-cli is using the interactive config command:

```bash
bbk-cli config
```

The interactive setup prompts for:

1. **email** (required) - Your Bitbucket account email
2. **api_token** (required) - Your Bitbucket API token
3. **workspace** (optional) - Default workspace to use with commands
4. **format** (optional) - Default output format (`json` or `toon`, defaults to `json`)

### Creating an API Token

Before running the config command, create an API token:

1. Go to [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label (e.g., "BBK CLI")
4. Copy the generated token

### Manual Configuration (Alternative)

You can also manually create the configuration file at `~/.bbkcli`:

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
  - `api_token`: Your Bitbucket API token

- **[defaults] section** - Optional default settings
  - `workspace`: Default workspace to use if not specified in commands (recommended)
  - `format`: Default output format (`json` or `toon`)

**Tip:** Setting a default workspace in your config file allows you to omit the workspace parameter from all commands, making them much more concise. You can still specify a workspace parameter in any command if you need to work with a different workspace.

## Quick Start

### First-Time Setup

Before using bbk-cli, configure your credentials:

```bash
bbk-cli config
```

Follow the interactive prompts to enter your Bitbucket email and API token.

### Interactive Mode

Start the CLI and interact with Bitbucket through a REPL:

```bash
bbk-cli
```

Once started, you'll see the `bbk>` prompt:

**Tip:** Set a default workspace in your config file (see Configuration section) to omit the workspace parameter from all commands.

```
bbk> list-repositories
bbk> get-repository {"repoSlug":"my-repo"}
bbk> list-pullrequests {"repoSlug":"my-repo","state":"OPEN"}
```

**Note:** You can optionally specify a workspace parameter if you need to work with a different workspace:

```
bbk> list-repositories {"workspace":"other-workspace"}
```

### Headless Mode

Execute single commands directly. (Note: Run `bbk-cli config` first to set up credentials):

**Tip:** Set a default workspace in your config file to omit the workspace parameter from commands.

```bash
# Test connection
bbk-cli test-connection

# List all repositories
bbk-cli list-repositories

# Get repository details
bbk-cli get-repository '{"repoSlug":"my-repo"}'

# List pull requests
bbk-cli list-pullrequests '{"repoSlug":"my-repo","state":"OPEN"}'

# Get pull request details
bbk-cli get-pullrequest '{"repoSlug":"my-repo","pullRequestId":123}'

# Create a new pull request
bbk-cli create-pullrequest '{"repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}'

# List issues
bbk-cli list-issues '{"repoSlug":"my-repo"}'

# Create an issue
bbk-cli create-issue '{"repoSlug":"my-repo","title":"Bug found","kind":"bug"}'
```

**Note:** You can optionally specify a workspace parameter if working with multiple workspaces:

```bash
bbk-cli list-repositories '{"workspace":"other-workspace"}'
```

## Available Commands

**Note:** All commands support an optional `workspace` parameter if you need to work with a different workspace than your default.

### Repository Commands

- **list-repositories** - List all repositories in a workspace

  ```bash
  bbk> list-repositories
  bbk> list-repositories {"format":"json"}
  ```

- **get-repository** - Get details of a specific repository
  ```bash
  bbk> get-repository {"repoSlug":"my-repo"}
  ```

### Pull Request Commands

- **list-pullrequests** - List pull requests in a repository

  ```bash
  bbk> list-pullrequests {"repoSlug":"my-repo"}
  bbk> list-pullrequests {"repoSlug":"my-repo","state":"OPEN"}
  ```

- **get-pullrequest** - Get details of a specific pull request

  ```bash
  bbk> get-pullrequest {"repoSlug":"my-repo","pullRequestId":123}
  ```

- **create-pullrequest** - Create a new pull request

  ```bash
  bbk> create-pullrequest {"repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}
  bbk> create-pullrequest {"repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main","description":"PR description"}
  ```

  **Note**: This command automatically adds the repository's default reviewers (excluding the PR author) to the pull request.

### Branch Commands

- **list-branches** - List branches in a repository

  ```bash
  bbk> list-branches {"repoSlug":"my-repo"}
  ```

### Commit Commands

- **list-commits** - List commits in a repository

  ```bash
  bbk> list-commits {"repoSlug":"my-repo"}
  bbk> list-commits {"repoSlug":"my-repo","branch":"main"}
  ```

### Issue Commands

- **list-issues** - List issues in a repository

  ```bash
  bbk> list-issues {"repoSlug":"my-repo"}
  ```

- **get-issue** - Get details of a specific issue

  ```bash
  bbk> get-issue {"repoSlug":"my-repo","issueId":123}
  ```

- **create-issue** - Create a new issue

  ```bash
  bbk> create-issue {"repoSlug":"my-repo","title":"Bug found"}
  bbk> create-issue {"repoSlug":"my-repo","title":"Bug found","content":"Description here","kind":"bug","priority":"major"}
  ```

### Pipeline Commands

- **list-pipelines** - List pipelines in a repository

  ```bash
  bbk> list-pipelines {"repoSlug":"my-repo"}
  ```

### User Commands

- **get-user** - Get user information
  ```bash
  bbk> get-user  # Get current authenticated user
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
bbk> list-repositories
```

```bash
bbk-cli list-repositories '{"format":"json"}'
```

### TOON Format

[Token-Oriented Object Notation](https://github.com/toon-format/toon) for AI-optimized output:

```bash
bbk> format toon
bbk> list-pullrequests {"repoSlug":"my-repo"}
```

```bash
bbk-cli list-repositories '{"format":"toon"}'
```

## Security

⚠️ **Important Security Notes:**

1. **Never commit** `~/.bbkcli` to version control
2. The config file is created with secure permissions
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
