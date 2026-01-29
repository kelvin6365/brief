# Brief

> AI-optimized configuration generator for Cursor IDE, Claude Code, and Qoder.

[![npm version](https://img.shields.io/npm/v/@tszhim_tech/brief.svg)](https://www.npmjs.com/package/@tszhim_tech/brief)
[![npm downloads](https://img.shields.io/npm/dm/@tszhim_tech/brief.svg)](https://www.npmjs.com/package/@tszhim_tech/brief)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Brief auto-detects your tech stack and generates production-ready AI configuration files with best practices baked in.

## Installation

```bash
# Use directly with npx
npx @tszhim_tech/brief init

# Or install globally
npm install -g @tszhim_tech/brief
```

## Quick Start

```bash
brief init              # Interactive wizard (recommended)
brief init --yes        # Non-interactive with defaults
brief init --dry-run    # Preview changes
brief detect            # Show detected project info
brief templates         # List available templates
```

## Features

- **Auto-Detection** — Frameworks, languages, databases, ORMs, testing tools
- **Multi-Tool Support** — Cursor, Claude Code, Qoder configurations
- **Smart Templates** — Context-aware rules based on your stack
- **Merge Mode** — Intelligently merge with existing configs
- **Production Ready** — Security, testing, and performance patterns included

## Supported Tech

| Category | Technologies |
|----------|-------------|
| **Languages** | TypeScript, JavaScript, Python, Java, Go |
| **Frontend** | React, Next.js, Vue, Nuxt, Svelte, Astro |
| **Backend** | Express, Fastify, NestJS, FastAPI, Django, Spring Boot |
| **Databases** | PostgreSQL, MySQL, MongoDB, SQLite, Redis |
| **ORMs** | Prisma, Drizzle, TypeORM, Sequelize, SQLAlchemy |
| **Testing** | Jest, Vitest, Bun Test, Pytest, Playwright, Cypress |
| **Build** | Vite, Webpack, Turbopack, Bun, esbuild |

## Commands

| Command | Description |
|---------|-------------|
| `brief init` | Initialize AI configuration (interactive wizard) |
| `brief detect` | Detect and display project information |
| `brief add <template>` | Add a specific template |
| `brief remove <template>` | Remove a template |
| `brief sync` | Re-detect and sync configuration |
| `brief validate` | Validate configuration files |
| `brief templates` | List all available templates |

### Common Options

```bash
brief init --tool cursor      # Generate only Cursor rules
brief init --tool claude      # Generate only Claude config
brief init --tool qoder       # Generate only Qoder config
brief init --merge            # Smart merge with existing files
brief init --templates react,testing,security
```

## Generated Files

<details>
<summary><b>Cursor IDE</b> — <code>.cursor/rules/*.mdc</code></summary>

```
.cursor/rules/
├── core.mdc              # Core coding standards
├── memory-management.mdc # AI context optimization
├── typescript.mdc        # Language-specific rules
├── react.mdc             # Framework patterns
├── testing.mdc           # Testing best practices
├── security.mdc          # Security guidelines
└── ...
```
</details>

<details>
<summary><b>Claude Code</b> — <code>CLAUDE.md</code> + <code>.claude/</code></summary>

```
CLAUDE.md                 # Main configuration
.claude/
├── settings.json         # Claude settings
└── skills/
    ├── testing.md
    └── git-workflow.md
```
</details>

<details>
<summary><b>Qoder</b> — <code>.qoder/rules/*.md</code></summary>

```
.qoder/rules/
├── core.md               # Core standards
├── requirements-spec.md  # Quest mode requirements
├── project-info.md       # Tech stack info
├── security.md           # OWASP Top 10
├── testing.md            # Testing patterns
├── api-design.md         # API conventions
└── ...
```
</details>

## Roadmap

### Completed
- [x] Interactive wizard with project detection
- [x] Cursor, Claude Code, Qoder generators
- [x] TypeScript, JavaScript, Python, Java templates
- [x] React, Next.js, Vue, Express, FastAPI, Spring Boot support
- [x] Prisma ORM patterns
- [x] AI memory management templates
- [x] Smart merge with conflict resolution
- [x] Dry-run and backup modes

### Planned
- [ ] Standalone binary distribution
- [ ] VS Code extension
- [ ] Template marketplace
- [ ] Team/organization templates
- [ ] Cloud sync across machines
- [ ] AI-powered template generation

## Contributing

### Development Setup

```bash
# Clone the repository
git clone https://github.com/kelvin6365/brief.git
cd brief

# Install dependencies
bun install

# Build the project
bun run build
```

### Link Locally

To test the CLI locally before publishing:

```bash
# Option 1: Using bun
bun link                    # Register the package globally
bun link @tszhim_tech/brief # Link in another project

# Option 2: Using npm
npm link                    # Register the package globally
cd /path/to/test-project
npm link @tszhim_tech/brief # Use in another project

# Option 3: Run directly without linking
bun run cli init            # Run from the project directory
```

### Development Workflow

```bash
bun run dev          # Watch mode for development
bun run type-check   # TypeScript type checking
bun test             # Run tests
bun test --watch     # Run tests in watch mode
bun run build        # Build for production
```

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`bun test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Unlink

```bash
# When done testing
bun unlink @tszhim_tech/brief  # In the test project
bun unlink                      # In the brief directory

# Or with npm
npm unlink @tszhim_tech/brief
npm unlink
```

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Tech Stack Details](./docs/TECH-STACK.md)

## License

MIT — see [LICENSE](LICENSE) for details.

---

**[Issues](https://github.com/kelvin6365/brief/issues)** · **[Documentation](./docs/)** · **[NPM Package](https://www.npmjs.com/package/@tszhim_tech/brief)**
