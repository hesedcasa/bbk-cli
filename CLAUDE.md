# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install dependencies
npm install

# Build the TypeScript source
npm run build

# Run the CLI (development mode with tsx)
npm start

# Run in development (same as start)
npm run dev

# Run tests
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
npm run test:ui             # Run tests with UI
npm run test:coverage       # Run tests with coverage report

# Code quality
npm run format              # Format code with ESLint and Prettier
npm run find-deadcode       # Find unused exports with ts-prune
npm run pre-commit          # Run format + find-deadcode
```

## Project Architecture

This is a **Bitbucket CLI tool** (`bbk-cli`) that provides both interactive REPL and headless modes for Bitbucket Cloud operations using direct REST API calls with Basic authentication.

### Core Architecture Pattern

**No External Bitbucket Client Library**: This project implements Bitbucket API interactions directly using the native `fetch` API and Basic authentication. The `BitbucketUtil` class in `src/utils/bitbucket-utils.ts` handles all HTTP requests to `https://api.bitbucket.org/2.0`.

```
src/
├── index.ts                               # Main entry point
├── cli/
│   ├── index.ts                           # Barrel export
│   └── wrapper.ts                         # CLI class with REPL logic
├── commands/
│   ├── index.ts                           # Barrel export
│   ├── helpers.ts                         # Command info helpers
│   └── runner.ts                          # Headless command execution
├── config/
│   ├── index.ts                           # Barrel export
│   └── constants.ts                       # Command definitions
└── utils/
    ├── index.ts                           # Barrel export
    ├── arg-parser.ts                      # Command-line argument parser
    ├── config-loader.ts                   # YAML config file loader
    ├── bitbucket-client.ts                # Wrapper functions for Bitbucket operations
    └── bitbucket-utils.ts                 # Core Bitbucket utility class with API calls

tests/
├── unit/
│   ├── cli/
│   │   └── wrapper.test.ts
│   ├── commands/
│   │   ├── helpers.test.ts
│   │   └── runner.test.ts
│   └── utils/
│       ├── arg-parser.test.ts
│       └── config-loader.test.ts
└── integration/
    └── cli-integration.test.ts
```

### Core Components

#### Entry Point (`src/index.ts`)

- Bootstraps the application
- Parses command-line arguments via `parseArguments()`
- Routes to interactive REPL or headless mode
- Headless mode: executes command and exits
- Interactive mode: starts the `wrapper` class REPL

#### CLI Module (`src/cli/wrapper.ts`)

- **wrapper class**: Main orchestrator managing:
  - `connect()` - Loads configuration from `.claude/bitbucket-config.local.md`
  - `start()` - Initiates interactive REPL with readline interface
  - `handleCommand()` - Parses and processes user commands
  - `runCommand()` - Executes Bitbucket commands with result formatting
  - `disconnect()` - Graceful cleanup on exit signals (SIGINT/SIGTERM)

#### Commands Module (`src/commands/`)

- `helpers.ts` - Display command information and help
  - `printAvailableCommands()` - Lists all 13 available commands
  - `printCommandDetail(command)` - Shows detailed help for specific command
  - `getCurrentVersion()` - Reads version from package.json
- `runner.ts` - Execute commands in headless mode
  - `runCommand(command, arg, flag)` - Non-interactive command execution

#### Config Module (`src/config/constants.ts`)

- `COMMANDS[]` - Array of 13 Bitbucket command names
- `COMMANDS_INFO[]` - Brief descriptions for each command
- `COMMANDS_DETAIL[]` - Detailed parameter documentation

#### Utils Module (`src/utils/`)

- `arg-parser.ts` - Command-line argument handling
  - `parseArguments(args)` - Parses CLI flags (--help, --version, --commands) and routes to headless or interactive mode
- `config-loader.ts` - Configuration file management
  - `loadConfig(projectRoot)` - Loads `.claude/bitbucket-config.local.md`
  - `getBitbucketClientOptions(config, profileName)` - Extracts email and API token for Basic auth
  - TypeScript interfaces: `Config`, `BitbucketProfile`, `BitbucketClientOptions`
- `bitbucket-client.ts` - Wrapper functions for all Bitbucket operations
  - Exports: `listRepositories()`, `getRepository()`, `listPullRequests()`, `getPullRequest()`, `createPullRequest()`, `listBranches()`, `listCommits()`, `listIssues()`, `getIssue()`, `createIssue()`, `listPipelines()`, `getUser()`, `testConnection()`, `clearClients()`
  - Manages singleton `BitbucketUtil` instance
- `bitbucket-utils.ts` - Core Bitbucket utility class
  - `BitbucketUtil` class - Direct REST API calls to Bitbucket v2 API
  - Implements `makeRequest()` for authenticated HTTP requests using Basic auth
  - `formatResult()` - Outputs JSON or TOON format
  - Auth pooling per profile for efficiency

### Configuration System

The CLI loads Bitbucket profiles from `.claude/bitbucket-config.local.md` with YAML frontmatter:

```yaml
---
profiles:
  cloud:
    email: your-email@example.com
    apiToken: YOUR_BITBUCKET_APP_PASSWORD_HERE

defaultProfile: cloud
defaultFormat: json
---
```

**Key behaviors:**

- Uses Bitbucket **App Passwords** (not API tokens) for authentication
- Basic authentication header: `Authorization: Basic base64(email:apiToken)`
- Configuration is validated on load with email format validation
- Multi-profile support for different Bitbucket workspaces/accounts

### REPL Interface

- Custom prompt: `bbk>`
- **Special commands**: `help`, `commands`, `profiles`, `profile <name>`, `format <type>`, `clear`, `exit/quit/q`
- **Bitbucket commands**: 13 commands accepting JSON arguments
  1. `list-repositories` - List all repositories in a workspace
  2. `get-repository` - Get details of a specific repository
  3. `list-pullrequests` - List pull requests in a repository
  4. `get-pullrequest` - Get details of a specific pull request
  5. `create-pullrequest` - Create a new pull request (with auto-added default reviewers)
  6. `list-branches` - List branches in a repository (with query/sort support)
  7. `list-commits` - List commits in a repository
  8. `list-issues` - List issues in a repository
  9. `get-issue` - Get details of a specific issue
  10. `create-issue` - Create a new issue
  11. `list-pipelines` - List pipelines in a repository
  12. `get-user` - Get user information
  13. `test-connection` - Test Bitbucket API connection

### TypeScript Configuration

- **Target**: ES2022 modules (package.json `"type": "module"`)
- **Output**: Compiles to `dist/` directory with modular structure
- **Declarations**: Generates `.d.ts` files for all modules
- **Source Maps**: Enabled for debugging

## Available Commands

The CLI provides **13 Bitbucket commands**:

1. **list-repositories** - List all repositories in a workspace
2. **get-repository** - Get details of a specific repository
3. **list-pullrequests** - List pull requests in a repository
4. **get-pullrequest** - Get details of a specific pull request
5. **create-pullrequest** - Create a new pull request
6. **list-branches** - List branches in a repository
7. **list-commits** - List commits in a repository
8. **list-issues** - List issues in a repository
9. **get-issue** - Get details of a specific issue
10. **create-issue** - Create a new issue
11. **list-pipelines** - List pipelines in a repository
12. **get-user** - Get user information
13. **test-connection** - Test Bitbucket API connection

### Command Examples

```bash
# Start the CLI in interactive mode
npm start

# Inside the REPL:
bbk> commands                          # List all 13 commands
bbk> help                              # Show help
bbk> profiles                          # List available profiles
bbk> profile production                # Switch profile
bbk> format json                       # Change output format
bbk> list-repositories {"workspace":"myworkspace"}
bbk> get-repository {"workspace":"myworkspace","repoSlug":"my-repo"}
bbk> list-pullrequests {"workspace":"myworkspace","repoSlug":"my-repo","state":"OPEN"}
bbk> create-pullrequest {"workspace":"myworkspace","repoSlug":"my-repo","title":"Feature PR","sourceBranch":"feature/new","destinationBranch":"main"}
bbk> list-branches {"workspace":"myworkspace","repoSlug":"my-repo","q":"name~\"feature\""}
bbk> exit                              # Exit

# Headless mode (one-off commands):
npx bbk-cli test-connection
npx bbk-cli list-repositories '{"workspace":"myworkspace"}'
npx bbk-cli --commands        # List all commands
npx bbk-cli list-pullrequests -h     # Command-specific help
npx bbk-cli --help            # General help
npx bbk-cli --version         # Show version
```

## Code Structure & Module Responsibilities

### Entry Point (`index.ts`)

- Minimal bootstrapper
- Parses CLI args to determine execution mode
- Routes to interactive REPL or headless execution

### CLI Class (`cli/wrapper.ts`)

- Interactive REPL management with readline
- Configuration loading and profile switching
- User command processing and validation
- Bitbucket command execution with result formatting
- Graceful shutdown handling (SIGINT/SIGTERM)

### Command Helpers (`commands/helpers.ts`)

- Pure functions for displaying command information
- No external dependencies except config
- Easy to test

### Command Runner (`commands/runner.ts`)

- Headless/non-interactive execution
- Single command → result → exit pattern
- Independent configuration loading per execution

### Constants (`config/constants.ts`)

- Single source of truth for all command definitions
- Command names, descriptions, and parameter documentation
- No logic, just data

### Config Loader (`utils/config-loader.ts`)

- Reads and parses `.claude/bitbucket-config.local.md`
- Extracts YAML frontmatter with Bitbucket profiles
- Validates required fields (email, apiToken) for each profile
- Email format validation using regex
- Provides default values for settings

### Bitbucket Client (`utils/bitbucket-client.ts`)

- Wrapper functions for all Bitbucket operations
- Manages singleton `BitbucketUtil` instance
- Exports clean async functions for each command

### Bitbucket Utils (`utils/bitbucket-utils.ts`)

- **Core Bitbucket interaction logic using native fetch**
- Client pooling per profile (auth credentials cached)
- API call execution to `https://api.bitbucket.org/2.0`
- Result formatting (JSON, TOON)
- All 13 command implementations
- Basic authentication via `Authorization: Basic base64(email:apiToken)`

### Argument Parser (`utils/arg-parser.ts`)

- CLI flag parsing (--help, --version, --commands, etc.)
- Routing logic for different execution modes
- Command detection and validation

### Key Implementation Details

- **No External Bitbucket Library**: Uses native `fetch` API with Basic auth instead of a client library
- **Barrel Exports**: Each module directory has `index.ts` exporting public APIs
- **ES Modules**: All imports use `.js` extensions (TypeScript requirement)
- **Argument Parsing**: Supports JSON arguments for command parameters
- **Auth Pooling**: Reuses Basic auth credentials per profile for efficiency
- **Signal Handling**: Graceful shutdown on Ctrl+C (SIGINT) and SIGTERM
- **Error Handling**: Try-catch blocks with user-friendly error messages
- **Configuration**: YAML frontmatter in `.claude/bitbucket-config.local.md`

## Dependencies

**Runtime**:

- `yaml@^2.8.1` - YAML parser for config files
- `@toon-format/toon@^2.0.1` - TOON format encoder
- **No Bitbucket client library** - Uses native `fetch` with Basic auth

**Development**:

- `typescript@^5.0.0` - TypeScript compiler
- `tsx@^4.0.0` - TypeScript execution runtime
- `vitest@^4.0.9` - Test framework
- `eslint@^9.39.1` - Linting
- `prettier@3.8.0` - Code formatting
- `ts-prune@^0.10.3` - Find unused exports

## Testing

This project uses **Vitest** for testing with the following configuration:

- **Test Framework**: Vitest with globals enabled
- **Test Files**: `tests/**/*.test.ts`
- **Coverage**: V8 coverage provider with text, JSON, and HTML reports
- **Coverage Exclusions**: Barrel exports (`index.ts`), config files, test files

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode for development
npm run test:watch

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── cli/
│   │   └── wrapper.test.ts               # REPL logic tests
│   ├── commands/
│   │   ├── helpers.test.ts               # Command display tests
│   │   └── runner.test.ts                # Headless execution tests
│   └── utils/
│       ├── arg-parser.test.ts            # CLI argument parsing tests
│       └── config-loader.test.ts         # Config loading and validation
└── integration/
    └── cli-integration.test.ts           # End-to-end CLI tests
```

## Important Notes

1. **Configuration Required**: CLI requires `.claude/bitbucket-config.local.md` with valid Bitbucket profiles
2. **ES2022 Modules**: Project uses `"type": "module"` - no CommonJS
3. **API Authentication**: Uses Bitbucket App Passwords with Basic authentication
4. **Multi-Profile**: Supports multiple Bitbucket workspaces/accounts
5. **Flexible Output**: JSON or TOON formats for different use cases
6. **Auth Pooling**: Reuses credentials per profile for better performance
7. **No External Client**: Direct REST API calls using native fetch, not a Bitbucket client library

## Commit Message Convention

**Always use Conventional Commits format** for all commit messages and PR titles:

- `feat:` - New features or capabilities
- `fix:` - Bug fixes
- `docs:` - Documentation changes only
- `refactor:` - Code refactoring without changing functionality
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks, dependency updates, build configuration

**Examples:**

```
feat: add list-repositories command for Bitbucket workspaces
fix: handle connection timeout errors gracefully
docs: update configuration examples in README
refactor: extract API formatting into separate module
test: add integration tests for Bitbucket operations
chore: update dependencies to latest versions
```

When creating pull requests, the PR title must follow this format.
