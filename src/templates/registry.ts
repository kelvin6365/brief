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
    description:
      "Token optimization and memory management patterns for AI assistance",
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
    category: "pattern",
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
    category: "pattern",
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
    category: "pattern",
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
    category: "pattern",
    templatePath: "common/java.mdc.hbs",
    outputPath: ".cursor/rules/java.mdc",
    globs: ["**/*.java"],
    priority: 900,
    conditions: [{ type: "language", value: "java" }],
    tags: ["language", "java", "jdk21"],
  },
  {
    id: "go",
    name: "Go",
    description: "Go programming language standards and idioms",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/go.mdc.hbs",
    outputPath: ".cursor/rules/go.mdc",
    globs: ["**/*.go"],
    priority: 900,
    conditions: [{ type: "language", value: "go" }],
    tags: ["language", "go", "golang"],
  },
  {
    id: "rust",
    name: "Rust",
    description: "Rust programming language standards and idioms",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/rust.mdc.hbs",
    outputPath: ".cursor/rules/rust.mdc",
    globs: ["**/*.rs"],
    priority: 900,
    conditions: [{ type: "language", value: "rust" }],
    tags: ["language", "rust", "safe"],
  },
  {
    id: "ruby",
    name: "Ruby",
    description: "Ruby programming language standards and idioms",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/ruby.mdc.hbs",
    outputPath: ".cursor/rules/ruby.mdc",
    globs: ["**/*.rb", "**/Gemfile"],
    priority: 900,
    conditions: [{ type: "language", value: "ruby" }],
    tags: ["language", "ruby"],
  },
  {
    id: "dart",
    name: "Dart",
    description: "Dart programming language standards and idioms",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/dart.mdc.hbs",
    outputPath: ".cursor/rules/dart.mdc",
    globs: ["**/*.dart"],
    priority: 900,
    conditions: [{ type: "language", value: "dart" }],
    tags: ["language", "dart"],
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
  // Angular
  {
    id: "angular",
    name: "Angular",
    description: "Angular patterns and best practices",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/angular.mdc.hbs",
    outputPath: ".cursor/rules/angular.mdc",
    globs: ["**/*.ts", "**/*.html", "**/components/**/*"],
    priority: 800,
    dependencies: ["typescript"],
    conditions: [{ type: "framework", value: "angular" }],
    tags: ["framework", "angular", "frontend"],
  },
  // Svelte
  {
    id: "svelte",
    name: "Svelte",
    description: "Svelte and SvelteKit patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/svelte.mdc.hbs",
    outputPath: ".cursor/rules/svelte.mdc",
    globs: ["**/*.svelte", "**/lib/**/*", "**/routes/**/*"],
    priority: 800,
    conditions: [{ type: "framework", value: "svelte" }],
    tags: ["framework", "svelte", "frontend"],
  },
  // Nuxt.js
  {
    id: "nuxtjs",
    name: "Nuxt.js",
    description: "Nuxt.js patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/nuxtjs.mdc.hbs",
    outputPath: ".cursor/rules/nuxtjs.mdc",
    globs: [
      "**/pages/**/*",
      "**/layouts/**/*",
      "**/components/**/*",
      "nuxt.config.*",
    ],
    priority: 750,
    dependencies: ["vue"],
    conditions: [{ type: "framework", value: "nuxt" }],
    tags: ["framework", "nuxtjs", "vue", "fullstack"],
  },
  // Astro
  {
    id: "astro",
    name: "Astro",
    description: "Astro static site generation patterns",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/astro.mdc.hbs",
    outputPath: ".cursor/rules/astro.mdc",
    globs: ["**/*.astro", "astro.config.*"],
    priority: 750,
    conditions: [{ type: "framework", value: "astro" }],
    tags: ["framework", "astro", "frontend", "ssg"],
  },
  // SolidJS
  {
    id: "solidjs",
    name: "SolidJS",
    description: "SolidJS reactive patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/solidjs.mdc.hbs",
    outputPath: ".cursor/rules/solidjs.mdc",
    globs: ["**/*.jsx", "**/*.tsx", "**/*.tsx"],
    priority: 750,
    dependencies: ["typescript"],
    conditions: [{ type: "framework", value: "solid" }],
    tags: ["framework", "solidjs", "frontend"],
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
  // Ruby on Rails
  {
    id: "rails",
    name: "Ruby on Rails",
    description: "Ruby on Rails patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/rails.mdc.hbs",
    outputPath: ".cursor/rules/rails.mdc",
    globs: [
      "**/app/controllers/**/*",
      "**/app/models/**/*",
      "**/app/views/**/*",
      "**/config/routes.rb",
      "**/Gemfile",
      "**/config/application.rb",
    ],
    priority: 800,
    conditions: [{ type: "framework", value: "rails" }],
    tags: ["framework", "rails", "ruby", "backend", "fullstack"],
  },
  // Django
  {
    id: "django",
    name: "Django",
    description: "Django patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/django.mdc.hbs",
    outputPath: ".cursor/rules/django.mdc",
    globs: [
      "**/manage.py",
      "**/requirements.txt",
      "**/settings.py",
      "**/urls.py",
      "**/apps.py",
      "**/views.py",
      "**/models.py",
      "**/admin.py",
    ],
    priority: 800,
    dependencies: ["python"],
    conditions: [{ type: "framework", value: "django" }],
    tags: ["framework", "django", "python", "backend", "fullstack"],
  },
  // Flask
  {
    id: "flask",
    name: "Flask",
    description: "Flask patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/flask.mdc.hbs",
    outputPath: ".cursor/rules/flask.mdc",
    globs: [
      "**/app.py",
      "**/requirements.txt",
      "**/wsgi.py",
      "**/flask/**/*",
      "**/routes/**/*",
      "**/views/**/*",
    ],
    priority: 800,
    dependencies: ["python"],
    conditions: [{ type: "framework", value: "flask" }],
    tags: ["framework", "flask", "python", "backend", "api"],
  },
  // Go Gin
  {
    id: "gin",
    name: "Gin Framework",
    description: "Gin framework patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/gin.mdc.hbs",
    outputPath: ".cursor/rules/gin.mdc",
    globs: ["**/*.go", "**/go.mod", "**/main.go", "**/router/**/*"],
    priority: 800,
    dependencies: ["go"],
    conditions: [{ type: "framework", value: "gin" }],
    tags: ["framework", "gin", "go", "backend", "api"],
  },
  // Go Echo
  {
    id: "echo",
    name: "Echo Framework",
    description: "Echo framework patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/echo.mdc.hbs",
    outputPath: ".cursor/rules/echo.mdc",
    globs: ["**/*.go", "**/go.mod", "**/main.go", "**/handlers/**/*"],
    priority: 800,
    dependencies: ["go"],
    conditions: [{ type: "framework", value: "echo" }],
    tags: ["framework", "echo", "go", "backend", "api"],
  },
  // Rust Actix
  {
    id: "actix",
    name: "Actix Web",
    description: "Actix Web framework patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/actix.mdc.hbs",
    outputPath: ".cursor/rules/actix.mdc",
    globs: [
      "**/*.rs",
      "**/Cargo.toml",
      "**/src/main.rs",
      "**/src/handlers/**/*",
    ],
    priority: 800,
    dependencies: ["rust"],
    conditions: [{ type: "framework", value: "actix" }],
    tags: ["framework", "actix", "rust", "backend", "api"],
  },
  // Rust Axum
  {
    id: "axum",
    name: "Axum Framework",
    description: "Axum framework patterns and conventions",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/axum.mdc.hbs",
    outputPath: ".cursor/rules/axum.mdc",
    globs: ["**/*.rs", "**/Cargo.toml", "**/src/main.rs", "**/src/routes/**/*"],
    priority: 800,
    dependencies: ["rust"],
    conditions: [{ type: "framework", value: "axum" }],
    tags: ["framework", "axum", "rust", "backend", "api"],
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
  // React Native
  {
    id: "react-native",
    name: "React Native",
    description: "React Native mobile development patterns",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/react-native.mdc.hbs",
    outputPath: ".cursor/rules/react-native.mdc",
    globs: ["**/*.tsx", "**/*.jsx", "**/ios/**/*", "**/android/**/*"],
    priority: 750,
    dependencies: ["react", "typescript"],
    conditions: [{ type: "framework", value: "react-native" }],
    tags: ["framework", "react-native", "mobile", "ios", "android"],
  },
  // Flutter
  {
    id: "flutter",
    name: "Flutter",
    description: "Flutter mobile development patterns",
    target: ["cursor", "claude", "qoder"],
    category: "framework",
    templatePath: "common/flutter.mdc.hbs",
    outputPath: ".cursor/rules/flutter.mdc",
    globs: ["**/lib/**/*", "**/pubspec.yaml", "**/ios/**/*", "**/android/**/*"],
    priority: 750,
    conditions: [{ type: "framework", value: "flutter" }],
    tags: ["framework", "flutter", "mobile", "dart", "ios", "android"],
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
    globs: [
      "prisma/**/*",
      "**/*.prisma",
      "**/prisma.ts",
      "**/db.ts",
      "**/database.ts",
    ],
    priority: 850,
    conditions: [{ type: "hasDependency", value: "@prisma/client" }],
    tags: ["database", "orm", "prisma", "type-safety"],
  },
  {
    id: "typeorm",
    name: "TypeORM",
    description: "TypeORM patterns and database access conventions",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/typeorm.mdc.hbs",
    outputPath: ".cursor/rules/typeorm.mdc",
    globs: [
      "**/entities/**/*",
      "**/entity/**/*",
      "**/*.entity.ts",
      "**/typeorm.config.*",
    ],
    priority: 850,
    dependencies: ["typescript"],
    conditions: [{ type: "hasDependency", value: "typeorm" }],
    tags: ["database", "orm", "typeorm", "type-safety"],
  },
  {
    id: "mongoose",
    name: "Mongoose",
    description: "Mongoose ODM patterns and MongoDB conventions",
    target: ["cursor", "claude", "qoder"],
    category: "pattern",
    templatePath: "common/mongoose.mdc.hbs",
    outputPath: ".cursor/rules/mongoose.mdc",
    globs: [
      "**/models/**/*",
      "**/schemas/**/*",
      "**/*.schema.js",
      "**/*.model.js",
      "**/mongoose.config.*",
    ],
    priority: 850,
    dependencies: ["javascript"],
    conditions: [{ type: "hasDependency", value: "mongoose" }],
    tags: ["database", "odm", "mongoose", "mongodb"],
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
  {
    id: "docker",
    name: "Docker",
    description: "Docker containerization patterns and best practices",
    target: ["cursor", "claude", "qoder"],
    category: "project-type",
    templatePath: "common/docker.mdc.hbs",
    outputPath: ".cursor/rules/docker.mdc",
    globs: [
      "Dockerfile",
      "docker-compose.yml",
      "**/Dockerfile*",
      "**/docker-compose*.yml",
      "**/docker-compose*.yaml",
    ],
    priority: 750,
    tags: ["project-type", "docker", "containerization"],
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    description: "Kubernetes deployment and orchestration patterns",
    target: ["cursor", "claude", "qoder"],
    category: "project-type",
    templatePath: "common/kubernetes.mdc.hbs",
    outputPath: ".cursor/rules/kubernetes.mdc",
    globs: [
      "**/*.yaml",
      "**/*.yml",
      "**/k8s/**/*",
      "**/kubernetes/**/*",
      "kustomization.yaml",
    ],
    priority: 700,
    tags: ["project-type", "kubernetes", "orchestration", "cloud"],
  },
  {
    id: "terraform",
    name: "Terraform",
    description: "Terraform infrastructure as code patterns",
    target: ["cursor", "claude", "qoder"],
    category: "project-type",
    templatePath: "common/terraform.mdc.hbs",
    outputPath: ".cursor/rules/terraform.mdc",
    globs: ["**/*.tf", "**/*.tfvars", "**/terraform/**/*"],
    priority: 700,
    tags: ["project-type", "terraform", "iac", "infrastructure"],
  },
  {
    id: "aws-cdk",
    name: "AWS CDK",
    description: "AWS Cloud Development Kit patterns and best practices",
    target: ["cursor", "claude", "qoder"],
    category: "project-type",
    templatePath: "common/aws-cdk.mdc.hbs",
    outputPath: ".cursor/rules/aws-cdk.mdc",
    globs: ["**/cdk.json", "**/cdk*.ts", "**/cdk*.js", "**/lib/**/*"],
    priority: 700,
    tags: ["project-type", "aws-cdk", "aws", "iac", "cloud"],
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
    description:
      "Core coding standards and JetBrains AI Assistant instructions",
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
    description:
      "Development workflow and IDE-specific practices for JetBrains AI Assistant",
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
    description:
      "Code review guidelines and best practices for JetBrains AI Assistant",
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
    description:
      "Security best practices and vulnerability prevention for JetBrains AI Assistant",
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
    description:
      "Comprehensive error handling and recovery strategies for JetBrains",
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
    description:
      "Git conventions, commit messages, and PR guidelines for JetBrains",
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
  {
    id: "angular-fullstack",
    name: "Angular Full-Stack",
    description: "Angular with backend API and database",
    templates: [
      "cursor-core",
      "claude-core",
      "typescript",
      "angular",
      "api-design",
      "database",
      "testing",
    ],
    tags: ["fullstack", "angular"],
  },
  {
    id: "svelte-fullstack",
    name: "Svelte Full-Stack",
    description: "Svelte/SvelteKit with backend API and database",
    templates: [
      "cursor-core",
      "claude-core",
      "svelte",
      "api-design",
      "database",
      "testing",
    ],
    tags: ["fullstack", "svelte"],
  },
  {
    id: "nuxt-fullstack",
    name: "Nuxt.js Full-Stack",
    description: "Nuxt.js with backend API and database",
    templates: [
      "cursor-core",
      "claude-core",
      "typescript",
      "vue",
      "nuxtjs",
      "api-design",
      "database",
      "testing",
    ],
    tags: ["fullstack", "nuxtjs", "vue"],
  },
  {
    id: "rails-api",
    name: "Rails API",
    description: "Ruby on Rails API with database",
    templates: [
      "cursor-core",
      "claude-core",
      "ruby",
      "rails",
      "api-design",
      "database",
      "security",
      "testing",
    ],
    tags: ["backend", "rails", "ruby", "api"],
  },
  {
    id: "django-api",
    name: "Django API",
    description: "Django API with database",
    templates: [
      "cursor-core",
      "claude-core",
      "python",
      "django",
      "api-design",
      "database",
      "security",
      "testing",
    ],
    tags: ["backend", "django", "python", "api"],
  },
  {
    id: "flask-api",
    name: "Flask API",
    description: "Flask API with database",
    templates: [
      "cursor-core",
      "claude-core",
      "python",
      "flask",
      "api-design",
      "database",
      "security",
      "testing",
    ],
    tags: ["backend", "flask", "python", "api"],
  },
  {
    id: "go-gin-api",
    name: "Go Gin API",
    description: "Go with Gin framework API and database",
    templates: [
      "cursor-core",
      "claude-core",
      "go",
      "gin",
      "api-design",
      "database",
      "security",
      "testing",
    ],
    tags: ["backend", "go", "gin", "api"],
  },
  {
    id: "rust-actix-api",
    name: "Rust Actix API",
    description: "Rust with Actix Web API and database",
    templates: [
      "cursor-core",
      "claude-core",
      "rust",
      "actix",
      "api-design",
      "database",
      "security",
      "testing",
    ],
    tags: ["backend", "rust", "actix", "api"],
  },
  {
    id: "react-native-mobile",
    name: "React Native Mobile",
    description: "React Native mobile application",
    templates: [
      "cursor-core",
      "claude-core",
      "typescript",
      "react",
      "react-native",
      "testing",
    ],
    tags: ["mobile", "react-native", "ios", "android"],
  },
  {
    id: "flutter-mobile",
    name: "Flutter Mobile",
    description: "Flutter mobile application",
    templates: ["cursor-core", "claude-core", "dart", "flutter", "testing"],
    tags: ["mobile", "flutter", "ios", "android"],
  },
  {
    id: "docker-containerized",
    name: "Docker Containerized",
    description: "Docker containerization for applications",
    templates: ["cursor-core", "claude-core", "docker"],
    tags: ["docker", "containerization"],
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
