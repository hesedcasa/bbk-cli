# Bitbucket CLI

[![npm bbk-cli package](https://img.shields.io/npm/v/bbk-cli.svg)](https://npmjs.org/package/bbk-cli)

A powerful command-line interface for Bitbucket interaction with support for repositories, pull requests, issues, branches, commits, and pipelines.

## Features

- 💻 **Interactive REPL** for Bitbucket exploration and management
- 🚀 **Headless mode** for one-off command execution and automation
- 🔐 **Multi-profile support** for managing different Bitbucket accounts
- 📊 **Multiple output formats**: JSON or TOON
- 📦 **Repository management**: list and view repository details
- 🔀 **Pull request operations**: list, view, and create pull requests
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

### Step 1: Create API Token or App Password

1. Go to [Bitbucket Account Settings](https://bitbucket.org/account/settings/)
2. Click "App passwords" in the left sidebar
3. Click "Create app password"
4. Give it a label and select permissions (repositories:read, pull requests:write, etc.)
5. Copy the generated app password

### Step 2: Create Configuration File

Create a configuration file at `.claude/bitbucket-config.local.md` in your project root:

```markdown
---
profiles:
  cloud:
    username: your-username
    password: YOUR_APP_PASSWORD_HERE

defaultProfile: cloud
defaultFormat: json
---

# Bitbucket API Configuration

This file stores your Bitbucket API connection profiles.
```

### Configuration Options

- **profiles**: Named Bitbucket connection profiles
  - `username`: Your Bitbucket username (for username/password auth)
  - `password`: Your Bitbucket app password (for username/password auth)
  - `token`: Your API token (alternative to username/password)

- **defaultProfile**: Profile name to use when none specified
- **defaultFormat**: Default output format (`json` or `toon`)

### Multiple Profiles Example

```yaml
---
profiles:
  personal:
    username: myusername
    password: app_password_here

  work:
    token: work_token_here

defaultProfile: personal
defaultFormat: json
---
```

## Quick Start

### Interactive Mode

Start the CLI and interact with Bitbucket through a REPL:

```bash
npx bbk-cli
```

Once started, you'll see the `bb>` prompt:

```
bb> list-repositories {"workspace":"myworkspace"}
bb> get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}
bb> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}
```

### Headless Mode

Execute single commands directly:

```bash
# Test connection
npx bbk-cli test-connection

# List all repositories
npx bbk-cli list-repositories '{"workspace":"myworkspace"}'

# Get repository details
npx bbk-cli get-repository '{"workspace":"myworkspace","repoSlug":"my-repo"}'

# List pull requests
npx bbk-cli list-pullrequests '{"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}'

# Get pull request details
npx bbk-cli get-pullrequest '{"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123}'

# Create a new pull request
npx bbk-cli create-pullrequest '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}'

# List issues
npx bbk-cli list-issues '{"workspace":"myworkspace","repoSlug":"my-repo"}'

# Create an issue
npx bbk-cli create-issue '{"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found","kind":"bug"}'
```

## Available Commands

### Repository Commands

- **list-repositories** - List all repositories in a workspace

  ```bash
  bb> list-repositories {"workspace":"myworkspace"}
  bb> list-repositories {"workspace":"myworkspace","format":"json"}
  ```

- **get-repository** - Get details of a specific repository
  ```bash
  bb> get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}
  ```

### Pull Request Commands

- **list-pullrequests** - List pull requests in a repository

  ```bash
  bb> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo"}
  bb> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}
  ```

- **get-pullrequest** - Get details of a specific pull request

  ```bash
  bb> get-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123}
  ```

- **create-pullrequest** - Create a new pull request

  ```bash
  bb> create-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}
  bb> create-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main","description":"PR description"}
  ```

### Branch Commands

- **list-branches** - List branches in a repository

  ```bash
  bb> list-branches {"workspace":"myworkspace","repoSlug":"my-repo"}
  ```

### Commit Commands

- **list-commits** - List commits in a repository

  ```bash
  bb> list-commits {"workspace":"myworkspace","repoSlug":"my-repo"}
  bb> list-commits {"workspace":"myworkspace","repoSlug":"my-repo","branch":"main"}
  ```

### Issue Commands

- **list-issues** - List issues in a repository

  ```bash
  bb> list-issues {"workspace":"myworkspace","repoSlug":"my-repo"}
  ```

- **get-issue** - Get details of a specific issue

  ```bash
  bb> get-issue {"workspace":"myworkspace","repoSlug":"my-repo","issueId":123}
  ```

- **create-issue** - Create a new issue

  ```bash
  bb> create-issue {"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found"}
  bb> create-issue {"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found","content":"Description here","kind":"bug","priority":"major"}
  ```

### Pipeline Commands

- **list-pipelines** - List pipelines in a repository

  ```bash
  bb> list-pipelines {"workspace":"myworkspace","repoSlug":"my-repo"}
  ```

### User Commands

- **get-user** - Get user information
  ```bash
  bb> get-user
  bb> get-user {"username":"myusername"}
  ```

### Utility Commands

- **test-connection** - Test Bitbucket API connection
  ```bash
  bb> test-connection
  ```

## Interactive Mode Commands

Special commands available in the REPL:

- **commands** - List all available commands
- **help** or **?** - Show help message
- **profile \<name\>** - Switch to a different profile
- **profiles** - List all available profiles
- **format \<type\>** - Set output format (json, toon)
- **clear** - Clear the screen
- **exit**, **quit**, or **q** - Exit the CLI

## Output Formats

### JSON Format

Machine-readable JSON format (default):

```bash
bb> format json
bb> list-repositories {"workspace":"myworkspace"}
```

### TOON Format

[Token-Oriented Object Notation](https://github.com/toon-format/toon) for AI-optimized output:

```bash
bb> format toon
bb> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo"}
```

## Security

⚠️ **Important Security Notes:**

1. **Never commit** `.claude/bitbucket-config.local.md` to version control
2. Add `*.local.md` to your `.gitignore`
3. Keep your API tokens/app passwords secure and rotate them periodically
4. Use different credentials for different environments
5. App passwords have the same permissions as your user account

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
npx bbk-cli

# List all repositories in workspace
bb> list-repositories {"workspace":"myworkspace"}

# Get specific repository
bb> get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}

# List pull requests
bb> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}

# Get specific pull request
bb> get-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","pullRequestId":123}

# Create new pull request
bb> create-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}

# List branches
bb> list-branches {"workspace":"myworkspace","repoSlug":"my-repo"}

# List commits
bb> list-commits {"workspace":"myworkspace","repoSlug":"my-repo","branch":"main"}

# List issues
bb> list-issues {"workspace":"myworkspace","repoSlug":"my-repo"}

# Create issue
bb> create-issue {"workspace":"myworkspace","repoSlug":"my-repo","title":"Bug found","kind":"bug"}
```

### Automation Scripts

```bash
#!/bin/bash
# Get all repositories in workspace
npx bbk-cli list-repositories '{"workspace":"myworkspace"}' > repos.json

# Test connection
npx bbk-cli test-connection

# Create pull request from script
npx bbk-cli create-pullrequest '{
  "workspace": "myworkspace",
  "repoSlug": "my-repo",
  "title": "Automated PR",
  "sourceBranch": "feature/automated",
  "destinationBranch": "main",
  "description": "Created via automation script"
}'

# List all open pull requests
npx bbk-cli list-pullrequests '{
  "workspace": "myworkspace",
  "repoSlug": "my-repo",
  "state": "OPEN"
}' > open-prs.json
```

## Troubleshooting

### Connection Issues

```bash
# Test your connection
npx bbk-cli test-connection

# Common issues:
# 1. Invalid app password/token - regenerate credentials
# 2. Wrong username - use Bitbucket username
# 3. Incorrect authentication method - use either token OR username+password
```

### Authentication Errors

- Verify your app password or token is correct
- Check that the username matches your Bitbucket account
- Ensure you're using the right authentication method (token OR username+password)
- App passwords require proper permissions for the operations you want to perform

### Permission Errors

- App passwords inherit your user permissions
- Check that your Bitbucket account has access to the workspace/repository
- Some operations require specific repository permissions
- Pull request creation requires write access to the repository

## License

Apache-2.0

## Acknowledgments

Built with [bitbucket](https://www.npmjs.com/package/bitbucket) by [MunifTanjim](https://github.com/MunifTanjim/node-bitbucket) - A Bitbucket API client for Node.js and Browser
