/**
 * Template registry - defines all available templates
 */

import type { TemplateBundle, TemplateDefinition } from "./types.js";

/**
 * Core templates - always included
 */
export const CORE_TEMPLATES: TemplateDefinition[] = [
  // Cursor core rules
  {
    id: "cursor-core",
    name: "Cursor Core Rules",
    description: "Essential coding standards and AI behavior guidelines",
    target: "cursor",
    category: "core",
    templatePath: "cursor/core.mdc.hbs",
    outputPath: ".cursor/rules/core.mdc",
    priority: 1000,
    tags: ["essential"],
  },
  // Cursor memory management (2026)
  {
    id: "cursor-memory",
    name: "AI Memory & Context Management",
    description: "Token optimization and memory management patterns for AI assistance",
    target: "cursor",
    category: "core",
    templatePath: "cursor/memory-management.mdc.hbs",
    outputPath: ".cursor/rules/memory-management.mdc",
    priority: 950,
    tags: ["ai-optimization", "memory", "2026"],
  },
  // Claude core config
  {
    id: "claude-core",
    name: "Claude Code Configuration",
    description: "Main CLAUDE.md configuration file",
    target: "claude",
    category: "core",
    templatePath: "claude/CLAUDE.md.hbs",
    outputPath: "CLAUDE.md",
    priority: 1000,
    tags: ["essential"],
  },
];

/**
 * Language-specific templates
 */
export const LANGUAGE_TEMPLATES: TemplateDefinition[] = [
  {
    id: "typescript",
    name: "TypeScript",
    description: "TypeScript coding standards and type safety rules",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/typescript.mdc.hbs",
    outputPath: ".cursor/rules/typescript.mdc",
    globs: ["**/*.ts", "**/*.tsx"],
    priority: 900,
    conditions: [{ type: "language", value: "typescript" }],
    tags: ["language", "typescript"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    description: "JavaScript coding standards and best practices",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/javascript.mdc.hbs",
    outputPath: ".cursor/rules/javascript.mdc",
    globs: ["**/*.js", "**/*.jsx"],
    priority: 900,
    conditions: [{ type: "language", value: "javascript" }],
    tags: ["language", "javascript"],
  },
  {
    id: "python",
    name: "Python",
    description: "Python coding standards and PEP guidelines",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/python.mdc.hbs",
    outputPath: ".cursor/rules/python.mdc",
    globs: ["**/*.py"],
    priority: 900,
    conditions: [{ type: "language", value: "python" }],
    tags: ["language", "python"],
  },
  {
    id: "java",
    name: "Java",
    description: "Java 21+ coding standards and modern patterns",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/java.mdc.hbs",
    outputPath: ".cursor/rules/java.mdc",
    globs: ["**/*.java"],
    priority: 900,
    conditions: [{ type: "language", value: "java" }],
    tags: ["language", "java", "jdk21"],
  },
];

/**
 * Framework-specific templates
 */
export const FRAMEWORK_TEMPLATES: TemplateDefinition[] = [
  // React
  {
    id: "react",
    name: "React",
    description: "React component patterns and hooks best practices",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/react.mdc.hbs",
    outputPath: ".cursor/rules/react.mdc",
    globs: ["**/*.tsx", "**/*.jsx", "**/components/**/*"],
    priority: 800,
    dependencies: ["typescript"],
    conditions: [{ type: "framework", value: "react" }],
    tags: ["framework", "react", "frontend"],
  },
  // Next.js
  {
    id: "nextjs",
    name: "Next.js",
    description: "Next.js App Router patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/nextjs.mdc.hbs",
    outputPath: ".cursor/rules/nextjs.mdc",
    globs: ["**/app/**/*", "**/pages/**/*", "next.config.*"],
    priority: 750,
    dependencies: ["react", "typescript"],
    conditions: [{ type: "framework", value: "next" }],
    tags: ["framework", "nextjs", "react", "fullstack"],
  },
  // Vue
  {
    id: "vue",
    name: "Vue.js",
    description: "Vue 3 Composition API patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/vue.mdc.hbs",
    outputPath: ".cursor/rules/vue.mdc",
    globs: ["**/*.vue", "**/composables/**/*"],
    priority: 800,
    conditions: [{ type: "framework", value: "vue" }],
    tags: ["framework", "vue", "frontend"],
  },
  // Express
  {
    id: "express",
    name: "Express.js",
    description: "Express.js API patterns and middleware conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/express.mdc.hbs",
    outputPath: ".cursor/rules/express.mdc",
    globs: ["**/routes/**/*", "**/middleware/**/*", "**/controllers/**/*"],
    priority: 800,
    conditions: [{ type: "framework", value: "express" }],
    tags: ["framework", "express", "backend", "api"],
  },
  // FastAPI
  {
    id: "fastapi",
    name: "FastAPI",
    description: "FastAPI patterns and Pydantic model conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/fastapi.mdc.hbs",
    outputPath: ".cursor/rules/fastapi.mdc",
    globs: ["**/routers/**/*", "**/models/**/*", "**/schemas/**/*"],
    priority: 800,
    dependencies: ["python"],
    conditions: [{ type: "framework", value: "fastapi" }],
    tags: ["framework", "fastapi", "python", "backend", "api"],
  },
  // Spring Boot
  {
    id: "springboot",
    name: "Spring Boot",
    description: "Spring Boot 3.5.x patterns and production best practices",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/springboot.mdc.hbs",
    outputPath: ".cursor/rules/springboot.mdc",
    globs: [
      "**/src/main/java/**/*",
      "**/src/test/java/**/*",
      "**/application*.yml",
      "**/application*.yaml",
      "**/application*.properties",
    ],
    priority: 800,
    dependencies: ["java"],
    conditions: [{ type: "framework", value: "spring" }],
    tags: ["framework", "springboot", "java", "backend", "api"],
  },
];

/**
 * Database/ORM templates
 */
export const DATABASE_TEMPLATES: TemplateDefinition[] = [
  {
    id: "prisma",
    name: "Prisma ORM",
    description: "Prisma ORM patterns and type-safe database access",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/prisma.mdc.hbs",
    outputPath: ".cursor/rules/prisma.mdc",
    globs: ["prisma/**/*", "**/*.prisma", "**/prisma.ts", "**/db.ts", "**/database.ts"],
    priority: 850,
    conditions: [{ type: "hasDependency", value: "@prisma/client" }],
    tags: ["database", "orm", "prisma", "type-safety"],
  },
];

/**
 * Pattern templates - cross-cutting concerns
 */
export const PATTERN_TEMPLATES: TemplateDefinition[] = [
  {
    id: "testing",
    name: "Testing Patterns",
    description: "Testing conventions and best practices",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/testing.mdc.hbs",
    outputPath: ".cursor/rules/testing.mdc",
    globs: ["**/*.test.*", "**/*.spec.*", "**/tests/**/*", "**/__tests__/**/*"],
    priority: 700,
    tags: ["pattern", "testing"],
  },
  {
    id: "api-design",
    name: "API Design",
    description: "RESTful API design patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/api-design.mdc.hbs",
    outputPath: ".cursor/rules/api-design.mdc",
    globs: ["**/api/**/*", "**/routes/**/*", "**/endpoints/**/*"],
    priority: 700,
    tags: ["pattern", "api"],
  },
  {
    id: "database",
    name: "Database Patterns",
    description: "Database access patterns and query optimization",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/database.mdc.hbs",
    outputPath: ".cursor/rules/database.mdc",
    globs: [
      "**/db/**/*",
      "**/models/**/*",
      "**/migrations/**/*",
      "**/prisma/**/*",
    ],
    priority: 700,
    tags: ["pattern", "database"],
  },
  {
    id: "security",
    name: "Security Patterns",
    description: "Security best practices and vulnerability prevention",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/security.mdc.hbs",
    outputPath: ".cursor/rules/security.mdc",
    priority: 600,
    tags: ["pattern", "security"],
  },
  {
    id: "performance",
    name: "Performance Patterns",
    description: "Performance optimization guidelines",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/performance.mdc.hbs",
    outputPath: ".cursor/rules/performance.mdc",
    priority: 600,
    tags: ["pattern", "performance"],
  },
];

/**
 * Project type templates
 */
export const PROJECT_TYPE_TEMPLATES: TemplateDefinition[] = [
  {
    id: "cli",
    name: "CLI Application",
    description: "Command-line application patterns",
    target: ["cursor", "claude", "qoder"],
    category: "project-type",
    templatePath: "common/cli.mdc.hbs",
    outputPath: ".cursor/rules/cli.mdc",
    globs: ["**/cli/**/*", "**/commands/**/*", "**/bin/**/*"],
    priority: 750,
    tags: ["project-type", "cli"],
  },
  {
    id: "library",
    name: "Library/Package",
    description: "Library development patterns and API design",
    target: ["cursor", "claude", "qoder"],
    category: "project-type",
    templatePath: "common/library.mdc.hbs",
    outputPath: ".cursor/rules/library.mdc",
    priority: 750,
    tags: ["project-type", "library"],
  },
];

/**
 * Claude-specific templates (skills, commands)
 */
export const CLAUDE_TEMPLATES: TemplateDefinition[] = [
  {
    id: "claude-skill-testing",
    name: "Testing Skill",
    description: "Claude Code skill for testing patterns",
    target: "claude",
    category: "pattern",
    templatePath: "claude/skills/testing.md.hbs",
    outputPath: ".claude/skills/testing-patterns.md",
    priority: 500,
    tags: ["claude", "skill", "testing"],
  },
  {
    id: "claude-skill-git",
    name: "Git Workflow Skill",
    description: "Claude Code skill for git operations",
    target: "claude",
    category: "pattern",
    templatePath: "claude/skills/git-workflow.md.hbs",
    outputPath: ".claude/skills/git-workflow.md",
    priority: 500,
    tags: ["claude", "skill", "git"],
  },
  {
    id: "claude-settings",
    name: "Claude Settings",
    description: "Claude Code settings with hooks",
    target: "claude",
    category: "core",
    templatePath: "claude/settings.json.hbs",
    outputPath: ".claude/settings.json",
    priority: 900,
    tags: ["claude", "settings"],
  },
];

/**
 * Qoder-specific templates (Qoder - The Agentic Coding Platform)
 * Rules are stored in .qoder/rules/ directory
 *
 * Note: Framework/language templates (TypeScript, React, Prisma, etc.) are now shared
 * via LANGUAGE_TEMPLATES, FRAMEWORK_TEMPLATES, DATABASE_TEMPLATES, etc. with target: ["cursor", "claude", "qoder"]
 *
 * This section only contains Qoder-specific workflow/process templates.
 */
export const QODO_TEMPLATES: TemplateDefinition[] = [
  // Core Qoder-specific templates (Priority: 1000-900)
  {
    id: "qoder-quick-reference",
    name: "Quick Reference Guide",
    description: "How to use Qoder rules with @ reference system",
    target: "qoder",
    category: "core",
    templatePath: "qoder/quick-reference.md.hbs",
    outputPath: ".qoder/rules/quick-reference.md",
    priority: 1000,
    tags: ["qoder", "guide", "reference", "essential"],
  },
  {
    id: "qoder-core",
    name: "Qoder Core Rules",
    description: "Core coding standards and Qoder-specific instructions",
    target: "qoder",
    category: "core",
    templatePath: "qoder/core.md.hbs",
    outputPath: ".qoder/rules/core.md",
    priority: 1000,
    tags: ["qoder", "core", "essential"],
  },
  {
    id: "qoder-requirements-spec",
    name: "Requirements Specification",
    description: "Complete runnable code requirements and Quest Mode standards",
    target: "qoder",
    category: "core",
    templatePath: "qoder/requirements-spec.md.hbs",
    outputPath: ".qoder/rules/requirements-spec.md",
    priority: 950,
    tags: ["qoder", "requirements", "quest-mode", "essential"],
  },
  {
    id: "qoder-project-info",
    name: "Project Information",
    description: "Technology stack and project configuration for memory system",
    target: "qoder",
    category: "core",
    templatePath: "qoder/project-info.md.hbs",
    outputPath: ".qoder/rules/project-info.md",
    priority: 900,
    tags: ["qoder", "project-info", "memory"],
  },
  {
    id: "qoder-best-practices",
    name: "Qoder Best Practices",
    description: "Best practices and coding standards for Qoder",
    target: "qoder",
    category: "core",
    templatePath: "qoder/best-practices.md.hbs",
    outputPath: ".qoder/rules/best-practices.md",
    priority: 850,
    tags: ["qoder", "best-practices"],
  },

  // Qoder-specific quality templates (Priority: 800-700)
  {
    id: "qoder-security",
    name: "Security Guidelines",
    description: "Security best practices and OWASP Top 10 prevention",
    target: "qoder",
    category: "pattern",
    templatePath: "qoder/security.md.hbs",
    outputPath: ".qoder/rules/security.md",
    priority: 800,
    tags: ["qoder", "security", "owasp"],
  },
  {
    id: "qoder-testing",
    name: "Testing Rules",
    description: "Testing patterns and conventions for Qoder",
    target: "qoder",
    category: "pattern",
    templatePath: "qoder/testing.md.hbs",
    outputPath: ".qoder/rules/testing.md",
    globs: ["**/*.test.*", "**/*.spec.*", "**/tests/**", "**/__tests__/**"],
    priority: 750,
    tags: ["qoder", "testing"],
  },
  {
    id: "qoder-error-handling",
    name: "Error Handling Patterns",
    description: "Comprehensive error handling and recovery strategies",
    target: "qoder",
    category: "pattern",
    templatePath: "qoder/error-handling.md.hbs",
    outputPath: ".qoder/rules/error-handling.md",
    priority: 750,
    tags: ["qoder", "error-handling", "resilience"],
  },

  // Qoder-specific process templates (Priority: 700-600)
  {
    id: "qoder-git-workflow",
    name: "Git Workflow",
    description: "Git conventions, commit messages, and PR guidelines",
    target: "qoder",
    category: "pattern",
    templatePath: "qoder/git-workflow.md.hbs",
    outputPath: ".qoder/rules/git-workflow.md",
    priority: 700,
    tags: ["qoder", "git", "workflow"],
  },
  {
    id: "qoder-api-design",
    name: "API Design Patterns",
    description: "RESTful API conventions and best practices",
    target: "qoder",
    category: "pattern",
    templatePath: "qoder/api-design.md.hbs",
    outputPath: ".qoder/rules/api-design.md",
    globs: [
      "**/api/**/*",
      "**/routes/**/*",
      "**/routers/**/*",
      "**/endpoints/**/*",
    ],
    priority: 700,
    conditions: [
      { type: "hasFile", value: "**/api/**" },
      { type: "hasFile", value: "**/routes/**" },
      { type: "hasFile", value: "**/endpoints/**" },
      { type: "hasFile", value: "**/server.js" },
      { type: "hasFile", value: "**/server.ts" },
      { type: "hasFile", value: "**/app.js" },
      { type: "hasFile", value: "**/app.ts" },
    ],
    tags: ["qoder", "api", "rest"],
  },
  {
    id: "qoder-architecture",
    name: "Architecture Patterns",
    description: "Design patterns and architectural guidelines",
    target: "qoder",
    category: "pattern",
    templatePath: "qoder/architecture.md.hbs",
    outputPath: ".qoder/rules/architecture.md",
    priority: 650,
    tags: ["qoder", "architecture", "design-patterns"],
  },
];

/**
 * Shared documentation templates
 */
export const SHARED_TEMPLATES: TemplateDefinition[] = [
  {
    id: "architecture",
    name: "Architecture Documentation",
    description: "Project architecture overview",
    target: "shared",
    category: "core",
    templatePath: "shared/ARCHITECTURE.md.hbs",
    outputPath: "docs/ARCHITECTURE.md",
    priority: 400,
    tags: ["documentation", "architecture"],
  },
  {
    id: "tech-stack",
    name: "Tech Stack Documentation",
    description: "Technology stack overview",
    target: "shared",
    category: "core",
    templatePath: "shared/TECH-STACK.md.hbs",
    outputPath: "docs/TECH-STACK.md",
    priority: 400,
    tags: ["documentation", "tech-stack"],
  },
];

/**
 * JetBrains-specific templates (JetBrains AI Assistant)
 * Rules are stored in .aiassistant/rules/ directory
 */
export const JETBRAINS_TEMPLATES: TemplateDefinition[] = [
  // Core JetBrains-specific templates (Priority: 1000-900)
  {
    id: "jetbrains-core",
    name: "JetBrains Core Rules",
    description: "Core coding standards and JetBrains AI Assistant instructions",
    target: "jetbrains",
    category: "core",
    templatePath: "jetbrains/core.md.hbs",
    outputPath: ".aiassistant/rules/core.md",
    priority: 1000,
    tags: ["jetbrains", "core", "essential"],
  },
  {
    id: "jetbrains-workflow",
    name: "JetBrains Workflow Guidelines",
    description: "Development workflow and IDE-specific practices for JetBrains AI Assistant",
    target: "jetbrains",
    category: "core",
    templatePath: "jetbrains/workflow.md.hbs",
    outputPath: ".aiassistant/rules/workflow.md",
    priority: 950,
    tags: ["jetbrains", "workflow", "productivity"],
  },
  {
    id: "jetbrains-code-review",
    name: "Code Review Standards",
    description: "Code review guidelines and best practices for JetBrains AI Assistant",
    target: "jetbrains",
    category: "pattern",
    templatePath: "jetbrains/code-review.md.hbs",
    outputPath: ".aiassistant/rules/code-review.md",
    priority: 900,
    tags: ["jetbrains", "code-review", "quality"],
  },

  // JetBrains-specific quality templates (Priority: 800-700)
  {
    id: "jetbrains-security",
    name: "Security Guidelines",
    description: "Security best practices and vulnerability prevention for JetBrains AI Assistant",
    target: "jetbrains",
    category: "pattern",
    templatePath: "jetbrains/security.md.hbs",
    outputPath: ".aiassistant/rules/security.md",
    priority: 800,
    tags: ["jetbrains", "security", "owasp"],
  },
  {
    id: "jetbrains-testing",
    name: "Testing Rules",
    description: "Testing patterns and conventions for JetBrains AI Assistant",
    target: "jetbrains",
    category: "pattern",
    templatePath: "jetbrains/testing.md.hbs",
    outputPath: ".aiassistant/rules/testing.md",
    globs: ["**/*.test.*", "**/*.spec.*", "**/tests/**", "**/__tests__/**"],
    priority: 750,
    tags: ["jetbrains", "testing"],
  },
  {
    id: "jetbrains-error-handling",
    name: "Error Handling Patterns",
    description: "Comprehensive error handling and recovery strategies for JetBrains",
    target: "jetbrains",
    category: "pattern",
    templatePath: "jetbrains/error-handling.md.hbs",
    outputPath: ".aiassistant/rules/error-handling.md",
    priority: 750,
    tags: ["jetbrains", "error-handling", "resilience"],
  },

  // JetBrains-specific process templates (Priority: 700-600)
  {
    id: "jetbrains-git-workflow",
    name: "Git Workflow",
    description: "Git conventions, commit messages, and PR guidelines for JetBrains",
    target: "jetbrains",
    category: "pattern",
    templatePath: "jetbrains/git-workflow.md.hbs",
    outputPath: ".aiassistant/rules/git-workflow.md",
    priority: 700,
    tags: ["jetbrains", "git", "workflow"],
  },
  {
    id: "jetbrains-api-design",
    name: "API Design Patterns",
    description: "RESTful API conventions and best practices for JetBrains",
    target: "jetbrains",
    category: "pattern",
    templatePath: "jetbrains/api-design.md.hbs",
    outputPath: ".aiassistant/rules/api-design.md",
    globs: [
      "**/api/**/*",
      "**/routes/**/*",
      "**/routers/**/*",
      "**/endpoints/**/*",
    ],
    priority: 700,
    conditions: [
      { type: "hasFile", value: "**/api/**" },
      { type: "hasFile", value: "**/routes/**" },
      { type: "hasFile", value: "**/endpoints/**" },
      { type: "hasFile", value: "**/server.js" },
      { type: "hasFile", value: "**/server.ts" },
      { type: "hasFile", value: "**/app.js" },
      { type: "hasFile", value: "**/app.ts" },
    ],
    tags: ["jetbrains", "api", "rest"],
  },
  {
    id: "jetbrains-architecture",
    name: "Architecture Patterns",
    description: "Design patterns and architectural guidelines for JetBrains",
    target: "jetbrains",
    category: "pattern",
    templatePath: "jetbrains/architecture.md.hbs",
    outputPath: ".aiassistant/rules/architecture.md",
    priority: 650,
    tags: ["jetbrains", "architecture", "design-patterns"],
  },
];

/**
 * All templates combined
 */
export const ALL_TEMPLATES: TemplateDefinition[] = [
  ...CORE_TEMPLATES,
  ...LANGUAGE_TEMPLATES,
  ...FRAMEWORK_TEMPLATES,
  ...DATABASE_TEMPLATES,
  ...PATTERN_TEMPLATES,
  ...PROJECT_TYPE_TEMPLATES,
  ...CLAUDE_TEMPLATES,
  ...QODO_TEMPLATES,
  ...JETBRAINS_TEMPLATES,
  ...SHARED_TEMPLATES,
];

/**
 * Template bundles for common setups
 */
export const TEMPLATE_BUNDLES: TemplateBundle[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Just the essentials",
    templates: ["cursor-core", "claude-core"],
    tags: ["starter"],
  },
  {
    id: "typescript-react",
    name: "TypeScript + React",
    description: "Modern React development with TypeScript",
    templates: ["cursor-core", "claude-core", "typescript", "react", "testing"],
    tags: ["frontend", "react"],
  },
  {
    id: "nextjs-fullstack",
    name: "Next.js Full-Stack",
    description: "Next.js with API routes and database",
    templates: [
      "cursor-core",
      "claude-core",
      "typescript",
      "react",
      "nextjs",
      "api-design",
      "database",
      "testing",
    ],
    tags: ["fullstack", "nextjs"],
  },
  {
    id: "node-api",
    name: "Node.js API",
    description: "Node.js backend API development",
    templates: [
      "cursor-core",
      "claude-core",
      "typescript",
      "express",
      "api-design",
      "database",
      "security",
      "testing",
    ],
    tags: ["backend", "api"],
  },
  {
    id: "python-api",
    name: "Python API",
    description: "Python backend with FastAPI",
    templates: [
      "cursor-core",
      "claude-core",
      "python",
      "fastapi",
      "api-design",
      "database",
      "security",
      "testing",
    ],
    tags: ["backend", "python", "api"],
  },
  {
    id: "cli-tool",
    name: "CLI Tool",
    description: "Command-line application",
    templates: ["cursor-core", "claude-core", "typescript", "cli", "testing"],
    tags: ["cli"],
  },
  {
    id: "spring-boot-api",
    name: "Spring Boot API",
    description: "Spring Boot backend API development with Java 21+",
    templates: [
      "cursor-core",
      "claude-core",
      "java",
      "springboot",
      "api-design",
      "database",
      "security",
      "testing",
    ],
    tags: ["backend", "java", "api", "spring"],
  },
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): TemplateDefinition | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by target
 */
export function getTemplatesByTarget(
  target: "cursor" | "claude" | "qoder" | "jetbrains" | "shared"
): TemplateDefinition[] {
  return ALL_TEMPLATES.filter((t) => {
    if (Array.isArray(t.target)) {
      return t.target.includes(target);
    }
    return t.target === target;
  });
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: TemplateDefinition["category"]
): TemplateDefinition[] {
  return ALL_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get templates by tag
 */
export function getTemplatesByTag(tag: string): TemplateDefinition[] {
  return ALL_TEMPLATES.filter((t) => t.tags?.includes(tag));
}

/**
 * Get bundle by ID
 */
export function getBundle(id: string): TemplateBundle | undefined {
  return TEMPLATE_BUNDLES.find((b) => b.id === id);
}

/**
 * Resolve bundle to template definitions
 */
export function resolveBundleTemplates(bundleId: string): TemplateDefinition[] {
  const bundle = getBundle(bundleId);
  if (!bundle) return [];

  return bundle.templates
    .map((id) => getTemplate(id))
    .filter((t): t is TemplateDefinition => t !== undefined);
}
