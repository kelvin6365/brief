/**
 * Framework detection
 */

import type { DetectionContext, FrameworkInfo, FrameworkCategory } from "./types.js";
import { hasDependency, getDependencyVersion, hasFile, hasPythonPackage, countFiles } from "./utils.js";

interface FrameworkDefinition {
  name: string;
  category: FrameworkCategory;
  detect: (context: DetectionContext) => { confidence: number; source: string } | null;
}

const frameworkDefinitions: FrameworkDefinition[] = [
  // Frontend frameworks
  {
    name: "Next.js",
    category: "fullstack",
    detect: (ctx) => {
      if (!hasDependency(ctx, "next")) return null;
      const hasConfig = hasFile(ctx, "next.config.js") || hasFile(ctx, "next.config.mjs") || hasFile(ctx, "next.config.ts");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "next dependency + config" : "next dependency",
      };
    },
  },
  {
    name: "React",
    category: "frontend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "react")) return null;
      const jsxCount = countFiles(ctx, /\.[jt]sx$/);
      const confidence = jsxCount > 5 ? 85 : 70;
      return {
        confidence,
        source: `react dependency${jsxCount > 0 ? ` + ${jsxCount} jsx files` : ""}`,
      };
    },
  },
  {
    name: "Vue",
    category: "frontend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "vue")) return null;
      const vueCount = countFiles(ctx, /\.vue$/);
      return {
        confidence: vueCount > 0 ? 90 : 75,
        source: `vue dependency${vueCount > 0 ? ` + ${vueCount} .vue files` : ""}`,
      };
    },
  },
  {
    name: "Nuxt",
    category: "fullstack",
    detect: (ctx) => {
      if (!hasDependency(ctx, "nuxt")) return null;
      const hasConfig = hasFile(ctx, "nuxt.config.js") || hasFile(ctx, "nuxt.config.ts");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "nuxt dependency + config" : "nuxt dependency",
      };
    },
  },
  {
    name: "Svelte",
    category: "frontend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "svelte")) return null;
      const svelteCount = countFiles(ctx, /\.svelte$/);
      return {
        confidence: svelteCount > 0 ? 90 : 75,
        source: `svelte dependency${svelteCount > 0 ? ` + ${svelteCount} .svelte files` : ""}`,
      };
    },
  },
  {
    name: "SvelteKit",
    category: "fullstack",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@sveltejs/kit")) return null;
      return {
        confidence: 90,
        source: "@sveltejs/kit dependency",
      };
    },
  },
  {
    name: "Astro",
    category: "frontend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "astro")) return null;
      const hasConfig = hasFile(ctx, "astro.config.mjs") || hasFile(ctx, "astro.config.ts");
      return {
        confidence: hasConfig ? 95 : 80,
        source: hasConfig ? "astro dependency + config" : "astro dependency",
      };
    },
  },
  {
    name: "Remix",
    category: "fullstack",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@remix-run/react")) return null;
      return {
        confidence: 90,
        source: "@remix-run/react dependency",
      };
    },
  },
  {
    name: "Angular",
    category: "frontend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@angular/core")) return null;
      const hasConfig = hasFile(ctx, "angular.json");
      return {
        confidence: hasConfig ? 95 : 85,
        source: hasConfig ? "@angular/core + angular.json" : "@angular/core dependency",
      };
    },
  },

  // Backend frameworks (Node.js)
  {
    name: "Express",
    category: "backend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "express")) return null;
      return {
        confidence: 80,
        source: "express dependency",
      };
    },
  },
  {
    name: "Fastify",
    category: "backend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "fastify")) return null;
      return {
        confidence: 85,
        source: "fastify dependency",
      };
    },
  },
  {
    name: "NestJS",
    category: "backend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@nestjs/core")) return null;
      return {
        confidence: 90,
        source: "@nestjs/core dependency",
      };
    },
  },
  {
    name: "Hono",
    category: "backend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "hono")) return null;
      return {
        confidence: 85,
        source: "hono dependency",
      };
    },
  },
  {
    name: "Koa",
    category: "backend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "koa")) return null;
      return {
        confidence: 80,
        source: "koa dependency",
      };
    },
  },
  {
    name: "Elysia",
    category: "backend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "elysia")) return null;
      return {
        confidence: 85,
        source: "elysia dependency",
      };
    },
  },

  // Python frameworks
  {
    name: "FastAPI",
    category: "backend",
    detect: (ctx) => {
      if (!hasPythonPackage(ctx, "fastapi")) return null;
      return {
        confidence: 90,
        source: "fastapi in requirements",
      };
    },
  },
  {
    name: "Django",
    category: "fullstack",
    detect: (ctx) => {
      if (!hasPythonPackage(ctx, "django")) return null;
      const hasManagePy = hasFile(ctx, "manage.py");
      return {
        confidence: hasManagePy ? 95 : 85,
        source: hasManagePy ? "django + manage.py" : "django in requirements",
      };
    },
  },
  {
    name: "Flask",
    category: "backend",
    detect: (ctx) => {
      if (!hasPythonPackage(ctx, "flask")) return null;
      return {
        confidence: 85,
        source: "flask in requirements",
      };
    },
  },

  // Mobile frameworks
  {
    name: "React Native",
    category: "mobile",
    detect: (ctx) => {
      if (!hasDependency(ctx, "react-native")) return null;
      return {
        confidence: 90,
        source: "react-native dependency",
      };
    },
  },
  {
    name: "Expo",
    category: "mobile",
    detect: (ctx) => {
      if (!hasDependency(ctx, "expo")) return null;
      return {
        confidence: 90,
        source: "expo dependency",
      };
    },
  },

  // Electron
  {
    name: "Electron",
    category: "frontend",
    detect: (ctx) => {
      if (!hasDependency(ctx, "electron")) return null;
      return {
        confidence: 90,
        source: "electron dependency",
      };
    },
  },

  // Testing frameworks as libraries
  {
    name: "Storybook",
    category: "library",
    detect: (ctx) => {
      if (!hasDependency(ctx, "@storybook/react") && !hasDependency(ctx, "@storybook/vue3") && !hasDependency(ctx, "@storybook/svelte")) return null;
      const hasConfig = hasFile(ctx, ".storybook/main.js") || hasFile(ctx, ".storybook/main.ts");
      return {
        confidence: hasConfig ? 90 : 75,
        source: hasConfig ? "storybook dependency + config" : "storybook dependency",
      };
    },
  },
];

/**
 * Detect frameworks used in the project
 */
export function detectFrameworks(context: DetectionContext): FrameworkInfo[] {
  const detected: FrameworkInfo[] = [];

  for (const definition of frameworkDefinitions) {
    const result = definition.detect(context);
    if (result) {
      detected.push({
        name: definition.name,
        category: definition.category,
        version: getDependencyVersion(context, getMainDependency(definition.name)),
        confidence: result.confidence,
        source: result.source,
      });
    }
  }

  // Sort by confidence (highest first)
  return detected.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get the main dependency name for a framework
 */
function getMainDependency(frameworkName: string): string {
  const dependencyMap: Record<string, string> = {
    "Next.js": "next",
    React: "react",
    Vue: "vue",
    Nuxt: "nuxt",
    Svelte: "svelte",
    SvelteKit: "@sveltejs/kit",
    Astro: "astro",
    Remix: "@remix-run/react",
    Angular: "@angular/core",
    Express: "express",
    Fastify: "fastify",
    NestJS: "@nestjs/core",
    Hono: "hono",
    Koa: "koa",
    Elysia: "elysia",
    "React Native": "react-native",
    Expo: "expo",
    Electron: "electron",
    Storybook: "@storybook/react",
  };
  return dependencyMap[frameworkName] || frameworkName.toLowerCase();
}
