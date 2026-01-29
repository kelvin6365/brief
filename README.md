# Brief - AI Configuration Generator CLI

> A powerful CLI tool that intelligently generates AI-optimized configuration files for Cursor IDE, Claude Code, Qoder, and other AI coding tools.

[![npm version](https://img.shields.io/npm/v/@tszhim_tech/brief.svg)](https://www.npmjs.com/package/@tszhim_tech/brief)
[![npm downloads](https://img.shields.io/npm/dm/@tszhim_tech/brief.svg)](https://www.npmjs.com/package/@tszhim_tech/brief)
[![Build Status](https://github.com/kelvin6365/brief/workflows/CI/badge.svg)](https://github.com/kelvin6365/brief/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🆕 What's New (2026-01-29)

### ☕ Java & Spring Boot Support

- **🌱 Spring Boot 3.5.x** - 700+ lines of production patterns, virtual threads, layered architecture
- **☕ Java 21+ Template** - Records, sealed classes, pattern matching, modern idioms
- **🔍 Auto-Detection** - Maven pom.xml & Gradle build.gradle support for Spring Boot projects
- **📦 New Bundle** - `spring-boot-api` bundle with Java, Spring Boot, API, security, testing

### 🚀 Previous: Production-Grade Enhancements (2026-01-28)

- **✨ Prisma ORM Support** - 750+ lines of Prisma 7.0 best practices, N+1 prevention, type safety patterns
- **🧠 AI Memory Management** - Context optimization, token efficiency, 4-layer memory system
- **📈 2026 Cursor Rules** - Enhanced core & TypeScript templates with AI agent protocol
- **🔧 Template Engine Fix** - Fixed `contains` helper for framework detection in Qoder templates
- **📚 Complete Documentation** - ARCHITECTURE.md & TECH-STACK.md fully updated

See [CURSOR_TEMPLATES_2026_ENHANCEMENT.md](./CURSOR_TEMPLATES_2026_ENHANCEMENT.md) and [PRISMA_SUPPORT_ADDED.md](./PRISMA_SUPPORT_ADDED.md) for details.

---

## Why Use Brief?

Brief helps developers optimize their AI coding tools (Cursor, Claude Code, Qoder) by generating context-aware configuration files that:

- ✅ **Understand your tech stack** - Auto-detects frameworks, languages, databases, ORMs
- ✅ **Apply 2026 best practices** - Production-grade patterns, AI agent protocol, memory management
- ✅ **Provide AI context** - Project-specific guidelines, coding standards, security rules
- ✅ **Optimize token usage** - Efficient context management, smart pruning strategies
- ✅ **Reduce manual effort** - Generate 1,500+ lines of rules automatically

## Installation

```bash
# Use with npx (no install required)
npx @tszhim_tech/brief init

# Or install globally
npm install -g @tszhim_tech/brief

# Then run
brief init
```

## Quick Start

```bash
# Interactive wizard (recommended)
npx @tszhim_tech/brief init

# Non-interactive with defaults
npx @tszhim_tech/brief init --yes

# Preview without writing files
npx @tszhim_tech/brief init --dry-run

# Smart merge with existing configs
npx @tszhim_tech/brief init --merge

# Detect project info
npx @tszhim_tech/brief detect

# List available templates
npx @tszhim_tech/brief templates
```

## Features

### Implementation Status

| Feature                      | Status     | Description                              |
| ---------------------------- | ---------- | ---------------------------------------- |
| **Core CLI**                 |            |                                          |
| `init` command               | ✅ Done    | Initialize AI configuration              |
| `detect` command             | ✅ Done    | Detect project information               |
| `add` command                | ✅ Done    | Add templates to project                 |
| `remove` command             | ✅ Done    | Remove templates from project            |
| `sync` command               | ✅ Done    | Re-detect and sync configuration         |
| `validate` command           | ✅ Done    | Validate current configuration           |
| `templates` command          | ✅ Done    | List available templates                 |
| **Interactive UI**           |            |                                          |
| Interactive Wizard           | ✅ Done    | 7-step guided setup                      |
| Project Detection Display    | ✅ Done    | Show detected frameworks, tools          |
| Tool Selector (multi-select) | ✅ Done    | Choose Cursor/Claude/Qoder               |
| Template Selector            | ✅ Done    | Choose additional templates              |
| Confirmation Step            | ✅ Done    | Review before generation                 |
| Results Display              | ✅ Done    | Show generated files                     |
| Progress Indicators          | ✅ Done    | Spinners and progress bars               |
| **Project Detection**        |            |                                          |
| Language Detection           | ✅ Done    | TypeScript, JavaScript, Python, Go, Java |
| Framework Detection          | ✅ Done    | React, Next.js, Vue, Express, FastAPI    |
| Package Manager Detection    | ✅ Done    | npm, yarn, pnpm, bun                     |
| Testing Framework Detection  | ✅ Done    | Jest, Vitest, Bun Test, Pytest           |
| Build Tool Detection         | ✅ Done    | Webpack, Vite, Bun Bundler               |
| Database Detection           | ✅ Done    | PostgreSQL, MySQL, MongoDB, SQLite, Redis|
| ORM Detection                | ✅ Done    | **Prisma**, Drizzle, TypeORM, Sequelize  |
| Styling Detection            | ✅ Done    | Tailwind, CSS Modules, Styled Components |
| **Generators**               |            |                                          |
| Cursor Rules Generator       | ✅ Done    | .cursor/rules/\*.mdc files (2026 format) |
| Claude Code Generator        | ✅ Done    | CLAUDE.md, .claude/ config               |
| Qoder Generator              | ✅ Done    | .qoder/rules/\*.md (10 templates)        |
| Shared Docs Generator        | ✅ Done    | ARCHITECTURE.md, TECH-STACK.md           |
| **2026 Templates**           |            |                                          |
| Core Rules (Enhanced)        | ✅ Done    | AI agent protocol, 424 lines             |
| TypeScript Rules (Enhanced)  | ✅ Done    | TS 5.x+ advanced patterns, 577 lines     |
| **Memory Management (NEW)**  | ✅ Done    | Context optimization, 450 lines          |
| **Prisma ORM (NEW)**         | ✅ Done    | Prisma 7.0 patterns, 750+ lines          |
| JavaScript Rules             | ✅ Done    | JS-specific patterns                     |
| Python Rules                 | ✅ Done    | Python-specific patterns                 |
| React Rules                  | ✅ Done    | React patterns                           |
| Vue Rules                    | ✅ Done    | Vue patterns                             |
| Next.js Rules                | ✅ Done    | Next.js patterns                         |
| Express Rules                | ✅ Done    | Express patterns                         |
| FastAPI Rules                | ✅ Done    | FastAPI patterns                         |
| Testing Rules                | ✅ Done    | Testing best practices                   |
| Security Rules               | ✅ Done    | Security guidelines                      |
| Performance Rules            | ✅ Done    | Performance optimization                 |
| API Design Rules             | ✅ Done    | API best practices                       |
| Database Rules               | ✅ Done    | Database patterns                        |
| CLI Development Rules        | ✅ Done    | CLI tool patterns                        |
| Library Development Rules    | ✅ Done    | Library patterns                         |
| **Merge Mode**               |            |                                          |
| Smart Merge                  | ✅ Done    | Similarity-based merging                 |
| Diff Viewer                  | ✅ Done    | Color-coded diff display                 |
| Conflict Resolver            | ✅ Done    | Interactive conflict resolution          |
| Auto-merge (high similarity) | ✅ Done    | ≥95% similar = auto-merge                |
| Backup Before Changes        | ✅ Done    | Safety backups                           |
| **File Operations**          |            |                                          |
| Atomic Writes                | ✅ Done    | Safe file writing                        |
| Backup Creation              | ✅ Done    | Timestamped backups                      |
| Dry Run Mode                 | ✅ Done    | Preview without writing                  |
| **Testing**                  |            |                                          |
| Unit Tests                   | ✅ Done    | Detector/generator tests                 |
| Integration Tests            | ✅ Done    | End-to-end tests                         |
| Component Tests              | ✅ Done    | Ink component tests                      |
| **Distribution**             |            |                                          |
| NPM Package                  | ✅ Done    | `npm install -g @tszhim_tech/brief`      |
| Standalone Binary            | ⏳ Planned | `bun build --compile`                    |
| **Java/Spring Boot (NEW)**   |            |                                          |
| Java Language Rules          | ✅ Done    | Java 21+ patterns, records, virtual threads |
| Spring Boot Rules            | ✅ Done    | Spring Boot 3.5.x patterns, 700+ lines   |
| Spring Boot Detection        | ✅ Done    | Maven pom.xml & Gradle detection         |
| **Future Features**          |            |                                          |
| AI-powered Generation        | 💡 Future  | LLM-assisted templates                   |
| Template Marketplace         | 💡 Future  | Share/download templates                 |
| VS Code Extension            | 💡 Future  | IDE integration                          |
| Team Template Sharing        | 💡 Future  | Organization templates                   |
| Cloud Sync                   | 💡 Future  | Sync configs across machines             |

**Legend:** ✅ Done | ⏳ Planned | 💡 Future | ❌ Blocked

---

## 🎯 2026 Enhancements

### AI Agent Protocol (NEW!)

Templates now include **how AI should work**, not just what code to write:

- **Search First, Code Second** - Always check for existing patterns
- **Confirm Understanding** - Summarize before starting
- **Minimal Changes** - Fix specific issues only
- **Context Optimization** - Reference files, prune irrelevant context
- **Verification** - Check syntax, imports, edge cases

### Memory Management (NEW!)

First-class AI memory management with **4-layer context system**:

1. **Critical** - Always remember (architecture, security, contracts)
2. **Important** - Session-level (current task, patterns)
3. **Historical** - Reference when needed (past implementations)
4. **Archive** - Prune aggressively (outdated approaches)

**Auto-optimization triggers**:
- 50% full → Prune Archive
- 70% full → Compress Historical
- 85% full → Compress Important
- 95% full → Suggest session split

### Prisma ORM Support (NEW!)

Production-grade Prisma patterns:

- ✅ **Prisma 7.0** - 3x faster queries, 90% smaller bundles
- ✅ **N+1 Prevention** - `include`, `join` strategies
- ✅ **Singleton Pattern** - Prevent connection exhaustion
- ✅ **Type Safety** - Generated types, input types
- ✅ **Custom Output Path** - Next.js integration (critical pattern!)
- ✅ **Production Checklist** - 12-point deployment readiness

---

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

### Usage Examples

```bash
# Initialize with interactive wizard (recommended)
brief init

# Generate configurations for specific tools
brief init --tool cursor      # Only Cursor rules (2026 enhanced)
brief init --tool claude      # Only Claude config
brief init --tool qoder       # Only Qoder config (10 templates)

# Add specific templates
brief init --templates react,testing,security,prisma

# Smart merge with existing configs
brief init --merge

# Preview changes without applying
brief init --dry-run
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
brief add prisma         # Add Prisma ORM template (NEW!)
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

# Output includes:
# - cursor-core (424 lines, 2026 enhanced)
# - cursor-memory (450 lines)
# - typescript (577 lines, TS 5.x+ advanced)
# - java (400+ lines, Java 21+, NEW!)
# - springboot (700+ lines, Spring Boot 3.5.x, NEW!)
# - prisma (750+ lines, Prisma 7.0)
# - react, nextjs, vue, express, fastapi
# - testing, security, performance, api-design
# - 10 Qoder templates (core, security, testing, etc.)
```

---

## Generated Files

### Cursor IDE (2026 Format)

```
.cursor/
└── rules/
    ├── core.mdc                # Core standards (424 lines, 2026 enhanced)
    ├── memory-management.mdc   # AI memory optimization (450 lines, NEW!)
    ├── typescript.mdc          # TypeScript 5.x+ patterns (577 lines)
    ├── prisma.mdc              # Prisma ORM patterns (750+ lines, NEW!)
    ├── react.mdc               # React patterns (if detected)
    ├── nextjs.mdc              # Next.js patterns (if detected)
    ├── testing.mdc             # Testing best practices
    ├── security.mdc            # Security guidelines
    ├── performance.mdc         # Performance optimization
    ├── api-design.mdc          # API best practices
    └── ...
```

**2026 Enhancements**:
- ✅ Enhanced frontmatter (`alwaysApply`, `tags`, better descriptions)
- ✅ AI Agent Protocol (search, confirm, minimal changes)
- ✅ Memory Management (context layers, pattern recognition)
- ✅ Token Optimization (reference, batch, prune)
- ✅ Production Checklists (security, testing, deployment)

### Claude Code

```
CLAUDE.md                  # Main Claude configuration
.claude/
├── settings.json          # Claude Code settings
└── skills/
    ├── testing-patterns.md
    └── git-workflow.md
```

### Qoder (10 Production Templates)

```
.qoder/
└── rules/
    ├── core.md                    # Core coding standards
    ├── requirements-spec.md       # Complete runnable code standards
    ├── project-info.md            # Tech stack & configuration
    ├── best-practices.md          # Project-specific standards
    ├── security.md                # OWASP Top 10 prevention
    ├── testing.md                 # Testing patterns
    ├── error-handling.md          # Error patterns & recovery
    ├── git-workflow.md            # Git conventions
    ├── api-design.md              # RESTful API patterns (fixed!)
    └── architecture.md            # Design patterns
```

**Qoder-Specific Features**:
- ✅ Memory system integration (`user_prefer`, `project_info`, etc.)
- ✅ @ cross-reference support (`@core.md`, `@security.md`)
- ✅ Quest Mode optimization (no placeholders!)
- ✅ Dynamic framework adaptation (React, Next.js, FastAPI, etc.)

### Shared Documentation

```
docs/
├── ARCHITECTURE.md       # Project architecture (updated 2026)
└── TECH-STACK.md         # Technology stack (updated 2026)
```

---

## Tech Stack Support

### Languages
- TypeScript (5.x+ advanced patterns)
- JavaScript (ES2022+)
- Python (PEP 8, type hints)
- **Java** (21+ with records, virtual threads, pattern matching)
- Go

### Frameworks
- **Frontend**: React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Astro
- **Backend**: Express, Fastify, Koa, NestJS
- **Python**: FastAPI, Django, Flask
- **Java**: **Spring Boot** (3.5.x), Spring Data JPA, Spring Security
- **Full-Stack**: Next.js, Remix, SvelteKit

### Databases & ORMs
- **Databases**: PostgreSQL, MySQL, MongoDB, SQLite, Redis, Supabase, Firebase
- **ORMs**: **Prisma** (750+ line template!), Drizzle, TypeORM, Sequelize, Knex
- **Python ORMs**: SQLAlchemy, Django ORM

### Testing
- Jest, Vitest, Bun Test, Pytest, Mocha, Playwright, Cypress

### Build Tools
- Vite, Webpack, Turbopack, Bun Bundler, esbuild

### Package Managers
- npm, yarn, pnpm, bun

### Styling
- Tailwind CSS, CSS Modules, Styled Components, Emotion

---

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
│   │   ├── database.ts     # Database & ORM detection
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
│   ├── cursor/
│   │   ├── core.mdc.hbs            # 424 lines (2026 enhanced)
│   │   ├── memory-management.mdc.hbs # 450 lines
│   │   └── ...
│   ├── common/
│   │   ├── typescript.mdc.hbs      # 577 lines (TS 5.x+)
│   │   ├── java.mdc.hbs            # 400+ lines (Java 21+, NEW!)
│   │   ├── springboot.mdc.hbs      # 700+ lines (Spring Boot 3.5.x, NEW!)
│   │   ├── prisma.mdc.hbs          # 750+ lines
│   │   └── ...
│   ├── claude/
│   │   ├── CLAUDE.md.hbs
│   │   └── ...
│   ├── qoder/
│   │   ├── core.md.hbs
│   │   ├── api-design.md.hbs       # Fixed framework detection
│   │   └── ... (10 total)
│   └── shared/
│       ├── ARCHITECTURE.md.hbs     # Updated 2026
│       └── TECH-STACK.md.hbs       # Updated 2026
└── docs/                   # Documentation
    ├── ARCHITECTURE.md
    ├── TECH-STACK.md
    ├── CURSOR_TEMPLATES_2026_ENHANCEMENT.md
    ├── PRISMA_SUPPORT_ADDED.md
    └── PRISMA_CUSTOM_OUTPUT_ADDED.md
```

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **CLI Framework:** Commander
- **UI Framework:** React + Ink
- **Template Engine:** Handlebars
- **File Operations:** fs-extra, globby

## Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Complete architecture guide (updated 2026)
- **[TECH-STACK.md](./docs/TECH-STACK.md)** - Technology stack documentation (updated 2026)
- **[CURSOR_TEMPLATES_2026_ENHANCEMENT.md](./CURSOR_TEMPLATES_2026_ENHANCEMENT.md)** - 2026 Cursor rules research & enhancements
- **[PRISMA_SUPPORT_ADDED.md](./PRISMA_SUPPORT_ADDED.md)** - Prisma ORM integration details
- **[PRISMA_CUSTOM_OUTPUT_ADDED.md](./PRISMA_CUSTOM_OUTPUT_ADDED.md)** - Next.js + Prisma custom output pattern
- **[QODER_TEMPLATES_COMPLETE.md](./QODER_TEMPLATES_COMPLETE.md)** - Qoder templates production ready

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support & Community

- 🐛 [Issues](https://github.com/kelvin6365/brief/issues) - Report bugs and feature requests
- 📚 [Documentation](./docs/) - Detailed guides and architecture
- 🤝 [Contributing](#contributing) - Learn how to contribute

---

## Recent Updates

### 2026-01-28 - Production-Grade Release

- **✨ Prisma ORM Support** - 750+ lines covering Prisma 7.0, N+1 prevention, type safety, production patterns
- **🧠 Memory Management Template** - 450 lines of AI context optimization, 4-layer system, auto-pruning
- **📈 Enhanced Core Template** - 424 lines with AI agent protocol, memory management, security checklist
- **🎯 Enhanced TypeScript Template** - 577 lines with TS 5.x+ advanced patterns, branded types, template literals
- **🔧 Qoder Template Fix** - Fixed `contains` helper for framework-specific code generation
- **📚 Documentation Complete** - ARCHITECTURE.md, TECH-STACK.md fully updated with 2026 patterns

**Total Enhancement**: ~2,700+ lines of production-grade AI guidance added!

---

**Built with ❤️ for developers who use AI coding tools**

*Optimize your AI assistant • Generate better code • Ship faster*
