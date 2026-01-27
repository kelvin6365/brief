# Brief - AI Configuration Generator CLI

> A powerful CLI tool that intelligently generates AI-optimized configuration files for Cursor IDE, Claude Code, Qoder, and other AI coding tools.

[![npm version](https://img.shields.io/npm/v/brief-ai.svg)](https://www.npmjs.com/package/brief-ai)
[![npm downloads](https://img.shields.io/npm/dm/brief-ai.svg)](https://www.npmjs.com/package/brief-ai)
[![CI](https://github.com/kelvin6365/brief/actions/workflows/ci.yml/badge.svg)](https://github.com/kelvin6365/brief/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Installation

```bash
# Use with npx (no install required)
npx brief-ai init

# Or install globally
npm install -g brief-ai

# Then run
brief init
```

## Quick Start

```bash
# Interactive wizard (recommended)
npx brief-ai init

# Non-interactive with defaults
npx brief-ai init --yes

# Preview without writing files
npx brief-ai init --dry-run

# Smart merge with existing configs
npx brief-ai init --merge

# Detect project info
npx brief-ai detect
```

## Features

### Implementation Status

| Feature | Status | Description |
|---------|--------|-------------|
| **Core CLI** | | |
| `init` command | ✅ Done | Initialize AI configuration |
| `detect` command | ✅ Done | Detect project information |
| `add` command | ✅ Done | Add templates to project |
| `remove` command | ✅ Done | Remove templates from project |
| `sync` command | ✅ Done | Re-detect and sync configuration |
| `validate` command | ✅ Done | Validate current configuration |
| `templates` command | ✅ Done | List available templates |
| **Interactive UI** | | |
| Interactive Wizard | ✅ Done | 7-step guided setup |
| Project Detection Display | ✅ Done | Show detected frameworks, tools |
| Tool Selector (multi-select) | ✅ Done | Choose Cursor/Claude/Qoder |
| Template Selector | ✅ Done | Choose additional templates |
| Confirmation Step | ✅ Done | Review before generation |
| Results Display | ✅ Done | Show generated files |
| Progress Indicators | ✅ Done | Spinners and progress bars |
| **Project Detection** | | |
| Language Detection | ✅ Done | TypeScript, JavaScript, Python |
| Framework Detection | ✅ Done | React, Next.js, Vue, Express, FastAPI |
| Package Manager Detection | ✅ Done | npm, yarn, pnpm, bun |
| Testing Framework Detection | ✅ Done | Jest, Vitest, Bun Test, Pytest |
| Build Tool Detection | ✅ Done | Webpack, Vite, Bun Bundler |
| Database Detection | ✅ Done | PostgreSQL, MySQL, MongoDB, SQLite |
| Styling Detection | ✅ Done | Tailwind, CSS Modules, Styled Components |
| **Generators** | | |
| Cursor Rules Generator | ✅ Done | .cursor/rules/*.mdc files |
| Claude Code Generator | ✅ Done | CLAUDE.md, .claude/ config |
| Qoder Generator | ✅ Done | .qoder/ config files |
| Shared Docs Generator | ✅ Done | ARCHITECTURE.md, TECH-STACK.md |
| **Templates** | | |
| Core Rules | ✅ Done | Base coding standards |
| TypeScript Rules | ✅ Done | TS-specific patterns |
| JavaScript Rules | ✅ Done | JS-specific patterns |
| Python Rules | ✅ Done | Python-specific patterns |
| React Rules | ✅ Done | React patterns |
| Vue Rules | ✅ Done | Vue patterns |
| Next.js Rules | ✅ Done | Next.js patterns |
| Express Rules | ✅ Done | Express patterns |
| FastAPI Rules | ✅ Done | FastAPI patterns |
| Testing Rules | ✅ Done | Testing best practices |
| Security Rules | ✅ Done | Security guidelines |
| Performance Rules | ✅ Done | Performance optimization |
| API Design Rules | ✅ Done | API best practices |
| Database Rules | ✅ Done | Database patterns |
| CLI Development Rules | ✅ Done | CLI tool patterns |
| Library Development Rules | ✅ Done | Library patterns |
| **Merge Mode** | | |
| Smart Merge | ✅ Done | Similarity-based merging |
| Diff Viewer | ✅ Done | Color-coded diff display |
| Conflict Resolver | ✅ Done | Interactive conflict resolution |
| Auto-merge (high similarity) | ✅ Done | ≥95% similar = auto-merge |
| Backup Before Changes | ✅ Done | Safety backups |
| **File Operations** | | |
| Atomic Writes | ✅ Done | Safe file writing |
| Backup Creation | ✅ Done | Timestamped backups |
| Dry Run Mode | ✅ Done | Preview without writing |
| **Testing** | | |
| Unit Tests | ⏳ Planned | Detector/generator tests |
| Integration Tests | ⏳ Planned | End-to-end tests |
| Component Tests | ⏳ Planned | Ink component tests |
| **Distribution** | | |
| NPM Package | ⏳ Planned | `npm install -g aide` |
| Standalone Binary | ⏳ Planned | `bun build --compile` |
| **Future Features** | | |
| AI-powered Generation | 💡 Future | LLM-assisted templates |
| Template Marketplace | 💡 Future | Share/download templates |
| VS Code Extension | 💡 Future | IDE integration |
| Team Template Sharing | 💡 Future | Organization templates |
| Cloud Sync | 💡 Future | Sync configs across machines |

**Legend:** ✅ Done | ⏳ Planned | 💡 Future | ❌ Blocked

## Commands

### `brief init`

Initialize AI configuration for your project.

```bash
brief init [options]

Options:
  -t, --tool <tool>           Target tool (cursor, claude, qoder, hybrid, all)
  -y, --yes                   Skip prompts and use defaults
  -p, --path <path>           Project path (default: current directory)
  -d, --dry-run               Preview changes without writing files
  -m, --merge                 Smart merge with existing files
  --auto-merge-threshold <n>  Similarity threshold for auto-merge (0-1)
  --templates <templates>     Comma-separated list of templates
```

### `brief detect`

Detect and display project information.

```bash
brief detect [options]

Options:
  -j, --json     Output as JSON
  -p, --path     Project path
  -v, --verbose  Show detailed output
```

### `brief add <template>`

Add a template to your project.

```bash
brief add react          # Add React template
brief add testing        # Add testing template
brief add security       # Add security template
```

### `brief remove <template>`

Remove a template from your project.

```bash
brief remove react --remove-files  # Remove template and generated files
```

### `brief sync`

Re-detect project and synchronize configuration.

```bash
brief sync [options]

Options:
  -f, --force    Force regeneration
  -d, --dry-run  Preview changes
```

### `brief validate`

Validate current configuration files.

```bash
brief validate [options]

Options:
  -f, --fix      Fix issues automatically
  -v, --verbose  Show detailed output
```

### `brief templates`

List all available templates.

```bash
brief templates
```

## Generated Files

### Cursor IDE

```
.cursor/
└── rules/
    ├── core.mdc           # Core coding standards
    ├── typescript.mdc     # TypeScript patterns
    ├── react.mdc          # React patterns (if detected)
    ├── testing.mdc        # Testing best practices
    ├── security.mdc       # Security guidelines
    └── ...
```

### Claude Code

```
CLAUDE.md                  # Main Claude configuration
.claude/
├── settings.json          # Claude Code settings
└── skills/
    ├── testing-patterns.md
    └── git-workflow.md
```

### Qoder

```
.qoder/
├── core.md               # Core rules
├── testing.md            # Testing patterns
└── best-practices.md     # Best practices
```

### Shared Documentation

```
docs/
├── ARCHITECTURE.md       # Project architecture
└── TECH-STACK.md         # Technology stack
```

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Run the CLI
bun run cli init

# Type check
bun run type-check

# Run tests
bun test

# Build for production
bun run build
```

## Project Structure

```
brief/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── commands/           # Command implementations
│   │   ├── init.tsx        # Init command (interactive)
│   │   ├── detect.ts       # Detect command
│   │   ├── add.ts          # Add command
│   │   ├── remove.ts       # Remove command
│   │   ├── sync.ts         # Sync command
│   │   └── validate.ts     # Validate command
│   ├── components/         # Ink React components
│   │   ├── Wizard.tsx      # Interactive wizard
│   │   ├── DiffViewer.tsx  # Diff display
│   │   ├── ConflictResolver.tsx
│   │   └── ...
│   ├── detectors/          # Project detection
│   │   ├── framework.ts
│   │   ├── language.ts
│   │   ├── testing.ts
│   │   └── ...
│   ├── generators/         # File generators
│   │   ├── cursor/
│   │   ├── claude/
│   │   ├── qoder/
│   │   └── shared/
│   ├── templates/          # Template registry
│   └── utils/              # Utilities
│       ├── file-system.ts  # File operations + diff/merge
│       ├── template-engine.ts
│       └── logger.ts
├── templates/              # Handlebars templates
│   ├── cursor/*.mdc.hbs
│   ├── claude/*.hbs
│   ├── qoder/*.hbs
│   └── shared/*.hbs
└── tests/                  # Test files (planned)
```

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **CLI Framework:** Commander
- **UI Framework:** React + Ink
- **Template Engine:** Handlebars
- **File Operations:** fs-extra, globby

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Note:** This project is under active development. See the status table above for current implementation progress.
