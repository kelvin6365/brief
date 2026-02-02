/**
 * Magic kit registry
 * Defines framework-specific scaffolding kits for the `brief magic` command.
 */

import type { MagicKit } from "../types/index.js";

/**
 * Registered magic kits.
 *
 * NOTE: Keep this list framework-agnostic - adding a new kit should only
 * require appending a new object to this array.
 */
export const MAGIC_KITS: MagicKit[] = [
  {
    id: "nextjs",
    name: "Next.js App",
    description:
      "Next.js App Router with TypeScript, Tailwind CSS, and ShadCN-friendly setup",
    framework: "nextjs",
    language: "typescript",
    tools: ["cursor", "claude", "qoder"],
    dependencies: [
      { name: "next", strategy: "latest" },
      { name: "react", strategy: "latest" },
      { name: "react-dom", strategy: "latest" },
      // Tailwind CSS stack
      { name: "tailwindcss", strategy: "latest" },
      { name: "postcss", strategy: "latest" },
      { name: "autoprefixer", strategy: "latest" },
      // ShadCN-friendly utilities
      { name: "class-variance-authority", strategy: "latest" },
      { name: "clsx", strategy: "latest" },
      { name: "lucide-react", strategy: "latest" },
    ],
    devDependencies: [
      { name: "typescript", strategy: "latest" },
      { name: "@types/react", strategy: "latest" },
      { name: "@types/node", strategy: "latest" },
      { name: "eslint", strategy: "latest" },
      { name: "eslint-config-next", strategy: "latest" },
    ],
    templates: [
      "cursor-core",
      "claude-core",
      "typescript",
      "react",
      "nextjs",
      "testing",
      "api-design",
      "security",
    ],
    postSteps: ["cd <projectName>", "<pm> install", "<pm> run dev"],
  },
];

/**
 * Get a magic kit by ID.
 */
export function getMagicKit(id: string): MagicKit | undefined {
  return MAGIC_KITS.find((kit) => kit.id === id);
}

/**
 * List all available magic kits.
 */
export function listMagicKits(): MagicKit[] {
  return MAGIC_KITS.slice();
}
