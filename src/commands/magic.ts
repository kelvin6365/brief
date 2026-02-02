/**
 * Magic command implementation
 *
 * Provides `brief magic <kit>` for framework-specific AI configuration
 * on top of an existing project, backed by the detection + generator pipeline.
 */

import { detectProject } from "../detectors/index.js";
import type { FullProjectDetection } from "../detectors/types.js";
import { runGenerators } from "../generators/index.js";
import type { AiInitConfig, AiTool, MagicKit } from "../types/index.js";
import { createLogger } from "../utils/logger.js";
import {
  basename,
  isAbsolute,
  joinPath,
  normalizePath,
  resolvePath,
  writeFileSafe,
} from "../utils/file-system.js";
import { resolveDependencies } from "../utils/package-version.js";
import { getCliVersion } from "../utils/version.js";
import type { MagicOptions, MagicResult } from "./types.js";
import { getMagicKit } from "./magic-registry.js";

const log = createLogger("magic");

/**
 * Entry point for the `brief magic` command.
 */
export async function magicCommand(
  kitId: string,
  options: MagicOptions
): Promise<MagicResult> {
  const kit = getMagicKit(kitId);

  if (!kit) {
    return {
      success: false,
      error: `Unknown magic kit: ${kitId}`,
      message: undefined,
      kitId,
      projectPath: process.cwd(),
    };
  }

  const basePath = normalizePath(options.path ?? process.cwd());
  const targetDir = isAbsolute(basePath)
    ? basePath
    : resolvePath(process.cwd(), basePath);
  const projectName = options.name?.trim() || basename(targetDir) || kit.id;

  log.debug(`Running magic kit '${kit.id}' in ${targetDir}`);

  // Run detection on the existing project to feed into generators
  const detection = await detectProject(targetDir);

  // Build AI init configuration from the kit definition
  const config = await buildAiInitConfigFromKit(kit, detection);

  const generatorResult = await runGenerators({
    projectPath: targetDir,
    detection,
    config,
    dryRun: !!options.dryRun,
    mergeMode: false,
  });

  // Print next steps for the user
  const packageManager = options.packageManager ?? "bun";
  printPostSteps(kit, projectName, targetDir, packageManager);

  return {
    success: generatorResult.success,
    error: generatorResult.success
      ? undefined
      : "Generation completed with errors",
    message: generatorResult.success
      ? `Magic kit '${kit.id}' applied successfully`
      : `Magic kit '${kit.id}' completed with errors`,
    kitId: kit.id,
    projectPath: targetDir,
  };
}

/**
 * Scaffold a project based on the magic kit's framework.
 */
async function scaffoldProject(
  kit: MagicKit,
  targetDir: string,
  options: MagicOptions
): Promise<void> {
  switch (kit.framework) {
    case "nextjs":
      await scaffoldNextjsProject(kit, targetDir, options);
      break;
    default:
      throw new Error(
        `Scaffolding not implemented for framework: ${kit.framework}`
      );
  }
}

/**
 * Create a minimal Next.js App Router project with TypeScript and Tailwind.
 */
async function scaffoldNextjsProject(
  kit: MagicKit,
  targetDir: string,
  _options: MagicOptions
): Promise<void> {
  // package.json
  const projectName = basename(targetDir);
  const deps = await resolveDependencies(kit.dependencies);
  const devDeps = await resolveDependencies(kit.devDependencies);

  const packageJson = {
    name: projectName,
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: deps,
    devDependencies: devDeps,
  };

  await writeFileSafe(
    joinPath(targetDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
    { createDirs: true }
  );

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: "ESNext",
      lib: ["DOM", "DOM.Iterable", "ESNext"],
      allowJs: false,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "ESNext",
      moduleResolution: "Bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      types: ["node"],
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"],
  };

  await writeFileSafe(
    joinPath(targetDir, "tsconfig.json"),
    JSON.stringify(tsconfig, null, 2),
    { createDirs: true }
  );

  // next-env.d.ts
  const nextEnv =
    '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n';
  await writeFileSafe(joinPath(targetDir, "next-env.d.ts"), nextEnv, {
    createDirs: true,
  });

  // next.config.mjs
  const nextConfig =
    "/** @type {import('next').NextConfig} */\\nconst nextConfig = {\\n  reactStrictMode: true,\\n  swcMinify: true,\\n};\\n\\nexport default nextConfig;\\n";

  await writeFileSafe(joinPath(targetDir, "next.config.mjs"), nextConfig, {
    createDirs: true,
  });

  // Tailwind + PostCSS configs
  const tailwindConfig =
    "/** @type {import('tailwindcss').Config} */\nexport default {\n  content: [\n    './app/**/*.{ts,tsx}',\n    './components/**/*.{ts,tsx}',\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};\n";

  await writeFileSafe(
    joinPath(targetDir, "tailwind.config.mjs"),
    tailwindConfig,
    {
      createDirs: true,
    }
  );

  const postcssConfig =
    "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n";

  await writeFileSafe(
    joinPath(targetDir, "postcss.config.mjs"),
    postcssConfig,
    {
      createDirs: true,
    }
  );

  // App router structure
  const globalsCss =
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";
  await writeFileSafe(joinPath(targetDir, "app/globals.css"), globalsCss, {
    createDirs: true,
  });

  const layoutTsx =
    "import type { Metadata } from 'next';\nimport './globals.css';\nimport type { ReactNode } from 'react';\n\nexport const metadata: Metadata = {\n  title: 'Next.js App',\n  description: 'Generated by Brief magic nextjs kit',\n};\n\nexport default function RootLayout({\n  children,\n}: {\n  children: ReactNode;\n}) {\n  return (\n    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );\n}\n";

  await writeFileSafe(joinPath(targetDir, "app/layout.tsx"), layoutTsx, {
    createDirs: true,
  });

  const pageTsx =
    'export default function Page() {\n  return (\n    <main className="min-h-screen flex items-center justify-center bg-background">\n      <div className="text-center">\n        <h1 className="text-3xl font-semibold">Next.js + Tailwind</h1>\n        <p className="mt-2 text-muted-foreground">\n          Scaffolding generated by Brief magic kit.\n        </p>\n      </div>\n    </main>\n  );\n}\n';

  await writeFileSafe(joinPath(targetDir, "app/page.tsx"), pageTsx, {
    createDirs: true,
  });
}

async function buildAiInitConfigFromKit(
  kit: MagicKit,
  _detection: FullProjectDetection
): Promise<AiInitConfig> {
  const tools =
    kit.tools.length > 0
      ? kit.tools
      : (["cursor", "claude", "qoder"] as AiTool[]);

  const version = await getCliVersion();
  return {
    version,
    projectType: "app",
    framework: kit.framework,
    language: kit.language,
    tools,
    templates: kit.templates,
  };
}

function printPostSteps(
  kit: MagicKit,
  projectName: string,
  projectPath: string,
  packageManager: "bun" | "npm" | "pnpm" | "yarn"
): void {
  const pmCmd = packageManager;

  // eslint-disable-next-line no-console
  console.log("\nMagic kit:", kit.name);
  // eslint-disable-next-line no-console
  console.log("Project path:", projectPath);
  // eslint-disable-next-line no-console
  console.log("\nNext steps:\n");

  const steps = kit.postSteps ?? [
    "cd <projectName>",
    "<pm> install",
    "<pm> run dev",
  ];

  for (const step of steps) {
    const rendered = step
      .replace(/<projectName>/g, projectName)
      .replace(/<pm>/g, pmCmd);
    // eslint-disable-next-line no-console
    console.log("  " + rendered);
  }

  // eslint-disable-next-line no-console
  console.log("");
}
