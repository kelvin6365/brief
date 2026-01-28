# Architecture Overview

> Architecture documentation for Brief - AI Configuration Generator CLI

## System Overview

Brief is a **command-line interface (CLI) tool** that intelligently generates AI-optimized configuration files for Cursor IDE, Claude Code, Qoder, and other AI coding tools. It uses project detection, template generation, and smart merging to create context-aware configurations.

### Core Capabilities

1. **Project Detection** - Automatically detects languages, frameworks, testing tools, databases, and build systems
2. **Template Generation** - Generates tool-specific configurations (Cursor rules, Claude skills, Qoder rules)
3. **Smart Merging** - Intelligently merges with existing configurations using similarity analysis
4. **Interactive UI** - React-based terminal interface using Ink
5. **Cross-Platform** - Works on macOS, Linux, and Windows

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Language | TypeScript 5.6 (strict mode) | Type safety and developer experience |
| Runtime | Bun | Fast JavaScript runtime and package manager |
| CLI Framework | Commander | Command-line argument parsing |
| UI Framework | React 18 + Ink 5 | Terminal UI with React components |
| Layout Engine | Yoga | Flexbox-style terminal layouts |
| Template Engine | Handlebars | Dynamic template generation |
| File Operations | fs-extra, globby | Enhanced file system operations |
| Testing | Bun Test | Built-in test runner |

## Directory Structure

```
brief/
├── src/
│   ├── cli.ts              # CLI entry point (Commander setup)
│   ├── index.ts            # Main export for programmatic API
│   │
│   ├── commands/           # Command implementations
│   │   ├── init.tsx        # Init command (interactive wizard)
│   │   ├── detect.ts       # Project detection command
│   │   ├── add.ts          # Add template command
│   │   ├── remove.ts       # Remove template command
│   │   ├── sync.ts         # Sync configuration command
│   │   ├── validate.ts     # Validation command
│   │   ├── types.ts        # Command type definitions
│   │   ├── utils.ts        # Command utilities
│   │   └── index.ts        # Command exports
│   │
│   ├── components/         # Ink React components
│   │   ├── Wizard.tsx      # Multi-step wizard component
│   │   ├── ProjectInfo.tsx # Project detection display
│   │   ├── ToolSelector.tsx # Tool selection (multi-select)
│   │   ├── TemplateSelector.tsx # Template chooser
│   │   ├── ConfirmStep.tsx # Configuration confirmation
│   │   ├── Results.tsx     # Generation results display
│   │   ├── DiffViewer.tsx  # Color-coded diff viewer
│   │   ├── ConflictResolver.tsx # Interactive conflict resolution
│   │   ├── ProgressBar.tsx # Progress indicators
│   │   ├── StatusMessage.tsx # Status messages
│   │   ├── Spinner.tsx     # Loading spinners
│   │   ├── SelectList.tsx  # Selection list component
│   │   ├── types.ts        # Component type definitions
│   │   └── index.ts        # Component exports
│   │
│   ├── detectors/          # Project detection logic
│   │   ├── language.ts     # Language detection (TS, JS, Python, Go, Java)
│   │   ├── framework.ts    # Framework detection (React, Next.js, Vue, etc.)
│   │   ├── package-manager.ts # Package manager detection (npm, yarn, pnpm, bun)
│   │   ├── testing.ts      # Testing framework detection (Jest, Vitest, etc.)
│   │   ├── database.ts     # Database detection (PostgreSQL, MySQL, MongoDB, etc.)
│   │   ├── build-tools.ts  # Build tool detection (Webpack, Vite, Bun)
│   │   ├── styling.ts      # Styling detection (Tailwind, CSS Modules, etc.)
│   │   ├── ai-config.ts    # Existing AI config detection
│   │   ├── utils.ts        # Detector utilities
│   │   ├── types.ts        # Detector type definitions
│   │   └── index.ts        # Detector orchestrator
│   │
│   ├── generators/         # Configuration file generators
│   │   ├── cursor/         # Cursor rules generator (.mdc files)
│   │   │   └── index.ts
│   │   ├── claude/         # Claude Code generator (CLAUDE.md, skills)
│   │   │   └── index.ts
│   │   ├── qoder/          # Qoder generator (.qoder/rules/)
│   │   │   └── index.ts
│   │   ├── shared/         # Shared docs generator (ARCHITECTURE.md, etc.)
│   │   │   └── index.ts
│   │   ├── base.ts         # Base generator class
│   │   ├── orchestrator.ts # Generator orchestration
│   │   ├── types.ts        # Generator type definitions
│   │   └── index.ts        # Generator exports
│   │
│   ├── templates/          # Template registry and loading
│   │   ├── registry.ts     # Template definitions and metadata
│   │   ├── loader.ts       # Template file loading
│   │   ├── types.ts        # Template type definitions
│   │   └── index.ts        # Template exports
│   │
│   ├── utils/              # Utility functions
│   │   ├── file-system.ts  # File operations, diff, merge, backups
│   │   ├── template-engine.ts # Handlebars rendering
│   │   ├── validation.ts   # Configuration validation
│   │   ├── logger.ts       # Logging utilities
│   │   ├── terminal.ts     # Terminal utilities
│   │   └── index.ts        # Utility exports
│   │
│   └── types/              # Shared type definitions
│       └── index.ts
│
├── templates/              # Handlebars template files
│   ├── cursor/             # Cursor rule templates (.mdc.hbs)
│   │   ├── core.mdc.hbs
│   │   ├── typescript.mdc.hbs
│   │   ├── javascript.mdc.hbs
│   │   ├── python.mdc.hbs
│   │   ├── react.mdc.hbs
│   │   ├── nextjs.mdc.hbs
│   │   ├── vue.mdc.hbs
│   │   ├── express.mdc.hbs
│   │   ├── fastapi.mdc.hbs
│   │   ├── testing.mdc.hbs
│   │   ├── security.mdc.hbs
│   │   ├── performance.mdc.hbs
│   │   ├── api-design.mdc.hbs
│   │   ├── database.mdc.hbs
│   │   ├── cli.mdc.hbs
│   │   └── library.mdc.hbs
│   │
│   ├── claude/             # Claude Code templates
│   │   ├── CLAUDE.md.hbs
│   │   ├── settings.json.hbs
│   │   └── skills/
│   │       ├── testing.md.hbs
│   │       └── git-workflow.md.hbs
│   │
│   ├── qoder/              # Qoder rule templates
│   │   ├── core.md.hbs
│   │   ├── requirements-spec.md.hbs
│   │   ├── project-info.md.hbs
│   │   ├── best-practices.md.hbs
│   │   ├── security.md.hbs
│   │   ├── testing.md.hbs
│   │   ├── error-handling.md.hbs
│   │   ├── git-workflow.md.hbs
│   │   ├── api-design.md.hbs
│   │   ├── architecture.md.hbs
│   │   └── quick-reference.md.hbs
│   │
│   └── shared/             # Shared documentation templates
│       ├── ARCHITECTURE.md.hbs
│       └── TECH-STACK.md.hbs
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   └── TECH-STACK.md
│
├── dist/                   # Compiled output
├── package.json
├── tsconfig.json
└── bunfig.toml
```

## Architecture Patterns

### 1. Command Pattern

Each CLI command is implemented as a separate module in `src/commands/` with a consistent interface:

```typescript
interface CommandOptions {
  path?: string;
  tool?: ToolType;
  yes?: boolean;
  dryRun?: boolean;
  merge?: boolean;
  // ... command-specific options
}

export async function execute(options: CommandOptions): Promise<void> {
  // Command implementation
}
```

### 2. Detector Pattern

Project detection uses a **multi-detector orchestration pattern**:

```
Project Root
     ↓
Orchestrator (detectors/index.ts)
     ↓
├─→ Language Detector (TS, JS, Python, Go, Java)
├─→ Framework Detector (React, Next.js, Vue, Express, FastAPI)
├─→ Package Manager Detector (npm, yarn, pnpm, bun)
├─→ Testing Detector (Jest, Vitest, Bun Test, Pytest)
├─→ Database Detector (PostgreSQL, MySQL, MongoDB, SQLite)
├─→ Build Tool Detector (Webpack, Vite, Bun Bundler)
├─→ Styling Detector (Tailwind, CSS Modules, Styled Components)
└─→ AI Config Detector (existing Cursor/Claude/Qoder configs)
     ↓
Aggregated Project Info
```

Each detector:
- Reads package.json, requirements.txt, or other config files
- Analyzes dependencies and file structure
- Returns detected technologies with confidence scores

### 3. Generator Pattern

Generators follow a **template-based factory pattern**:

```
Project Info + User Selections
     ↓
Generator Orchestrator
     ↓
├─→ Cursor Generator
│   ├─→ Load templates (registry.ts)
│   ├─→ Compile with Handlebars
│   ├─→ Generate .cursor/rules/*.mdc files
│   └─→ Add YAML frontmatter (globs, priority)
│
├─→ Claude Generator
│   ├─→ Generate CLAUDE.md
│   ├─→ Generate .claude/settings.json
│   └─→ Generate .claude/skills/*.md
│
├─→ Qoder Generator
│   ├─→ Generate .qoder/rules/*.md
│   └─→ Add YAML frontmatter (trigger: manual)
│
└─→ Shared Docs Generator
    ├─→ Generate docs/ARCHITECTURE.md
    └─→ Generate docs/TECH-STACK.md
     ↓
Generated Files
```

### 4. Merge Strategy Pattern

Smart merging uses **similarity-based conflict resolution**:

```
Existing File + New Content
     ↓
Calculate Similarity (Levenshtein distance)
     ↓
High Similarity (≥95%)? ──Yes──→ Auto-merge
     ↓ No
Show Diff Viewer (color-coded)
     ↓
User Choice:
├─→ Keep existing
├─→ Use new
└─→ Manual edit
     ↓
Backup + Write
```

Features:
- Automatic backup creation (timestamped)
- Line-by-line diff display with colors
- Interactive conflict resolution
- Atomic file operations (temp file + rename)

### 5. Component Architecture (Ink)

React-based terminal UI follows **container/presentational pattern**:

```
Wizard (Container)
  ├─→ ProjectInfo (Presentational)
  │   └─→ Shows detection results
  │
  ├─→ ToolSelector (Interactive)
  │   └─→ Multi-select for Cursor/Claude/Qoder
  │
  ├─→ TemplateSelector (Interactive)
  │   └─→ Choose additional templates
  │
  ├─→ ConfirmStep (Presentational)
  │   └─→ Review configuration
  │
  └─→ Results (Presentational)
      └─→ Show generated files
```

Key Ink patterns:
- `useInput()` for keyboard handling
- `useState()` for component state
- `useEffect()` for side effects
- `<Box>` for flexbox layout (Yoga)
- `<Text>` for styled terminal text

### 6. Template System

Templates use **Handlebars with dynamic sections**:

```handlebars
---
globs: ["**/*.ts", "**/*.tsx"]
priority: 100
---

# TypeScript Rules

{{#if projectInfo.framework.includes "react"}}
## React + TypeScript Patterns
...
{{/if}}

{{#if projectInfo.database}}
## Database Integration
...
{{/if}}
```

Features:
- YAML frontmatter for metadata
- Conditional sections based on project detection
- Variable interpolation
- Framework-specific content
- Cross-references using @ syntax (Qoder)

## Data Flow

### Interactive Init Flow

```
User runs: brief init
     ↓
Parse CLI arguments (Commander)
     ↓
Detect project (Orchestrator)
     ↓
Render Wizard (Ink React)
     ↓
User selects tools & templates
     ↓
Generate configuration (Orchestrator)
     ↓
Merge mode? ──Yes──→ Show diffs, resolve conflicts
     ↓ No
Write files (atomic operations)
     ↓
Show results
     ↓
Exit
```

### Smart Merge Flow

```
Generate new content
     ↓
Existing file found?
     ↓ Yes
Read existing content
     ↓
Calculate similarity score
     ↓
≥95% similar? ──Yes──→ Auto-merge (skip)
     ↓ No
Render DiffViewer component
     ↓
Show line-by-line diff (red/green)
     ↓
User chooses: keep/replace/edit
     ↓
Create backup (.bak timestamp)
     ↓
Write to temp file
     ↓
Rename atomically
     ↓
Confirm success
```

## Configuration Files

### .brief.json (Project State)

Stores user's configuration choices for reproducibility:

```json
{
  "version": "0.1.5",
  "projectType": "cli",
  "language": "typescript",
  "framework": "react",
  "testing": "bun-test",
  "tools": ["cursor", "claude", "qoder"],
  "templates": ["testing", "security", "cli"],
  "lastSync": "2026-01-28T12:00:00.000Z"
}
```

### Generated Files

**Cursor** (.cursor/rules/*.mdc):
- YAML frontmatter with globs, priority
- Markdown content with rules
- Auto-activated on file pattern match

**Claude** (CLAUDE.md, .claude/):
- Main CLAUDE.md with project context
- settings.json with hooks, permissions
- skills/ directory with reusable skills

**Qoder** (.qoder/rules/*.md):
- YAML frontmatter with `trigger: manual`
- Memory category mapping
- @ cross-reference support
- Quest Mode optimization

**Shared** (docs/):
- ARCHITECTURE.md (this file)
- TECH-STACK.md (technology documentation)

## Key Design Decisions

### 1. Bun Runtime
- **Why**: 3x faster than Node.js, built-in TypeScript support, no transpilation needed
- **Trade-off**: Smaller ecosystem than Node, but sufficient for CLI tool

### 2. Ink for UI
- **Why**: React components in terminal, familiar development model, great layout system
- **Trade-off**: More complex than simple prompts, but provides richer interactions

### 3. Handlebars Templates
- **Why**: Simple syntax, logic-less design, mature ecosystem
- **Trade-off**: Limited logic, but that's a feature (keeps templates clean)

### 4. Template Registry
- **Why**: Centralized metadata, easy to add new templates, supports conditions/globs
- **Trade-off**: Must update registry when adding templates, but enforces consistency

### 5. Smart Merging
- **Why**: Respects user customizations, shows diffs, safety backups
- **Trade-off**: More complex than overwriting, but critical for real-world usage

### 6. Similarity-Based Auto-Merge
- **Why**: If files are 95%+ similar, skip user prompt (likely no meaningful changes)
- **Trade-off**: May occasionally skip desired updates, but reduces noise

## Extension Points

### Adding a New Command

1. Create `src/commands/new-command.ts`
2. Implement command logic with types
3. Register in `src/cli.ts`:
   ```typescript
   program
     .command('new-command')
     .description('...')
     .action(newCommand.execute);
   ```
4. Add tests
5. Update documentation

### Adding a New Detector

1. Create `src/detectors/new-detector.ts`
2. Implement detection logic:
   ```typescript
   export async function detect(projectPath: string): Promise<Detection> {
     // Read files, analyze dependencies
   }
   ```
3. Register in `src/detectors/index.ts` orchestrator
4. Update types in `src/detectors/types.ts`
5. Add tests

### Adding a New Template

1. Create template file in `templates/{tool}/new-template.hbs`
2. Add to registry in `src/templates/registry.ts`:
   ```typescript
   {
     id: 'new-template',
     name: 'New Template',
     category: 'quality',
     tool: 'cursor',
     outputPath: '.cursor/rules/new-template.mdc',
     templatePath: 'cursor/new-template.mdc.hbs',
     priority: 800,
     globs: ['**/*.ts'],
     conditions: { hasTypeScript: true },
     tags: ['typescript', 'quality']
   }
   ```
3. Template is now available in wizard
4. Test with `brief init --templates new-template`

### Adding a New Tool

1. Create generator in `src/generators/new-tool/index.ts`
2. Implement generator class extending `BaseGenerator`
3. Create templates in `templates/new-tool/`
4. Register in `src/generators/orchestrator.ts`
5. Add to tool selection in `src/components/ToolSelector.tsx`
6. Update types in `src/generators/types.ts`

## Performance Considerations

- **Lazy Loading**: Templates loaded on-demand, not at startup
- **Parallel Detection**: Detectors run concurrently using `Promise.all()`
- **Minimal Bundle**: Only essential dependencies included
- **Atomic Writes**: Temp file + rename (no partial writes)
- **Streaming**: Large files processed in chunks

## Testing Strategy

### Unit Tests (Bun Test)

- Detectors: Mock file system, test detection logic
- Generators: Test template rendering, file generation
- Utils: Test diff/merge, file operations, validation

### Integration Tests

- Full init flow: Run in test project, verify output
- Merge scenarios: Test with existing configs
- Error cases: Invalid inputs, missing files, permissions

### Manual Testing Checklist

- [ ] Empty directory (fresh init)
- [ ] Existing project (merge mode)
- [ ] Each framework (React, Next.js, Vue, Express, FastAPI, etc.)
- [ ] Tool-specific mode (cursor/claude/qoder only)
- [ ] Hybrid mode (all tools)
- [ ] Dry-run mode (preview)
- [ ] Cross-platform (macOS, Linux, Windows)

## Security Considerations

- **Path Validation**: Prevent path traversal attacks
- **Input Sanitization**: Validate all user inputs
- **Template Safety**: No code execution in templates
- **Respect .gitignore**: Don't read sensitive files
- **File Permissions**: Generated files have safe permissions (644)
- **Backup Strategy**: Always backup before overwriting

## Future Architecture Enhancements

- **Plugin System**: Allow third-party generators and detectors
- **AI-Powered Generation**: LLM-assisted custom templates
- **Template Marketplace**: Share/download community templates
- **Caching Layer**: Cache detection results for faster re-runs
- **Incremental Generation**: Only regenerate changed templates
- **Remote Configuration**: Cloud-synced configs across machines

---

*Last Updated: 2026-01-28*
*Version: 0.1.5*
*Generated for Brief - AI Configuration Generator CLI*