/**
 * Framework detection
 */

import type {
  DetectionContext,
  FrameworkCategory,
  FrameworkInfo,
} from "./types.js";
import {
  countFiles,
  getDependencyVersion,
  hasDependency,
  hasFile,
  hasGradleDependency,
  hasMavenDependency,
  hasPythonPackage,
} from "./utils.js";

interface FrameworkDefinition {
  name: string;
  category: FrameworkCategory;
  detect: (
    context: DetectionContext
  ) => { confidence: number; source: string } | null;
}

const frameworkDefinitions: FrameworkDefinition[] = [
  // Frontend frameworks
  {
    name: "Next.js",
    category: "fullstack",
    detect: (ctx) => {
      if (!hasDependency(ctx, "next")) return null;
      const hasConfig =
        hasFile(ctx, "next.config.js") ||
        hasFile(ctx, "next.config.mjs") ||
        hasFile(ctx, "next.config.ts");
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
        source: `react dependency${
          jsxCount > 0 ? ` + ${jsxCount} jsx files` : ""
        }`,
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
        source: `vue dependency${
          vueCount > 0 ? ` + ${vueCount} .vue files` : ""
        }`,
      };
    },
  },
  {
    name: "Nuxt",
    category: "fullstack",
    detect: (ctx) => {
      if (!hasDependency(ctx, "nuxt")) return null;
      const hasConfig =
        hasFile(ctx, "nuxt.config.js") || hasFile(ctx, "nuxt.config.ts");
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
        source: `svelte dependency${
          svelteCount > 0 ? ` + ${svelteCount} .svelte files` : ""
        }`,
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
      const hasConfig =
        hasFile(ctx, "astro.config.mjs") || hasFile(ctx, "astro.config.ts");
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
        source: hasConfig
          ? "@angular/core + angular.json"
          : "@angular/core dependency",
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

  // Java frameworks
  {
    name: "Spring Boot",
    category: "backend",
    detect: (ctx) => {
      const hasAppConfig =
        hasFile(ctx, "application.properties") ||
        hasFile(ctx, "application.yml") ||
        hasFile(ctx, "application.yaml") ||
        hasFile(ctx, /src\/main\/resources\/application/);

      // Check Maven pom.xml for Spring Boot
      if (ctx.pomXml) {
        // Check parent (spring-boot-starter-parent)
        const hasSpringParent =
          ctx.pomXml.parent?.artifactId === "spring-boot-starter-parent" ||
          ctx.pomXml.parent?.groupId === "org.springframework.boot";

        // Check dependencies for any spring-boot-starter
        const hasSpringDep = hasMavenDependency(ctx, "spring-boot-starter");

        if (hasSpringParent || hasSpringDep) {
          return {
            confidence: hasAppConfig ? 95 : 85,
            source: hasAppConfig
              ? "pom.xml spring-boot + application config"
              : "pom.xml spring-boot dependency",
          };
        }
      }

      // Check Gradle build.gradle for Spring Boot
      if (ctx.buildGradle && ctx.buildGradleContent) {
        const hasSpringPlugin =
          hasGradleDependency(ctx, "org.springframework.boot") ||
          hasGradleDependency(ctx, "spring-boot-starter");

        if (hasSpringPlugin) {
          return {
            confidence: hasAppConfig ? 95 : 90,
            source: hasAppConfig
              ? "build.gradle spring-boot + application config"
              : "build.gradle spring-boot plugin",
          };
        }
      }

      // Fallback: Check for Spring Boot application class pattern
      const hasAppClass = ctx.files.some(
        (f) => /Application\.java$/.test(f) || /@SpringBootApplication/.test(f)
      );
      if (hasAppClass && hasAppConfig) {
        return {
          confidence: 80,
          source: "Spring Boot application class + config",
        };
      }

      return null;
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

  // Ruby on Rails
  {
    name: "Ruby on Rails",
    category: "fullstack",
    detect: (ctx) => {
      if (!hasFile(ctx, "Gemfile") || !hasFile(ctx, "config/application.rb"))
        return null;
      // Check for rails in Gemfile (the ctx.rubyGems would need to be added, but we'll use a simpler approach)
      // Just checking for the presence of Gemfile and application.rb is strong indicator
      return {
        confidence: 90,
        source: "Gemfile + config/application.rb",
      };
    },
  },

  // Flutter
  {
    name: "Flutter",
    category: "mobile",
    detect: (ctx) => {
      if (!hasFile(ctx, "pubspec.yaml")) return null;
      // For now, we can only check for the existence of pubspec.yaml
      // Actual content checking would require additional context in DetectionContext
      return {
        confidence: 80,
        source: "pubspec.yaml exists",
      };
    },
  },

  // Go frameworks
  {
    name: "Gin",
    category: "backend",
    detect: (ctx) => {
      if (!ctx.goMod) return null; // go.mod exists
      // Since we can't easily check the content of go.mod, we'll check for typical Gin project structure
      // Gin projects often have main.go or server.go in the root
      const hasMainGo = hasFile(ctx, "main.go");
      const hasServerGo = hasFile(ctx, "server.go");
      if (hasMainGo || hasServerGo) {
        return {
          confidence: 85,
          source: "go.mod + main.go or server.go",
        };
      }
      return {
        confidence: 75,
        source: "go.mod exists",
      };
    },
  },
  {
    name: "Echo",
    category: "backend",
    detect: (ctx) => {
      if (!ctx.goMod) return null; // go.mod exists
      // Echo projects often have main.go or server.go in the root
      const hasMainGo = hasFile(ctx, "main.go");
      const hasServerGo = hasFile(ctx, "server.go");
      if (hasMainGo || hasServerGo) {
        return {
          confidence: 80,
          source: "go.mod + main.go or server.go",
        };
      }
      return {
        confidence: 70,
        source: "go.mod exists",
      };
    },
  },

  // Rust frameworks
  {
    name: "Actix",
    category: "backend",
    detect: (ctx) => {
      if (!ctx.cargoToml) return null; // Cargo.toml exists
      // Since we can't easily check the content of Cargo.toml, we'll check for typical Actix project structure
      // Actix projects often have main.rs or server.rs in src/
      const hasMainRs = hasFile(ctx, "src/main.rs");
      const hasServerRs = hasFile(ctx, "src/server.rs");
      if (hasMainRs || hasServerRs) {
        return {
          confidence: 85,
          source: "Cargo.toml + src/main.rs or src/server.rs",
        };
      }
      return {
        confidence: 75,
        source: "Cargo.toml exists",
      };
    },
  },
  {
    name: "Axum",
    category: "backend",
    detect: (ctx) => {
      if (!ctx.cargoToml) return null; // Cargo.toml exists
      // Axum projects often have main.rs or server.rs in src/
      const hasMainRs = hasFile(ctx, "src/main.rs");
      const hasServerRs = hasFile(ctx, "src/server.rs");
      if (hasMainRs || hasServerRs) {
        return {
          confidence: 80,
          source: "Cargo.toml + src/main.rs or src/server.rs",
        };
      }
      return {
        confidence: 70,
        source: "Cargo.toml exists",
      };
    },
  },

  // Testing frameworks as libraries
  {
    name: "Storybook",
    category: "library",
    detect: (ctx) => {
      if (
        !hasDependency(ctx, "@storybook/react") &&
        !hasDependency(ctx, "@storybook/vue3") &&
        !hasDependency(ctx, "@storybook/svelte")
      )
        return null;
      const hasConfig =
        hasFile(ctx, ".storybook/main.js") ||
        hasFile(ctx, ".storybook/main.ts");
      return {
        confidence: hasConfig ? 90 : 75,
        source: hasConfig
          ? "storybook dependency + config"
          : "storybook dependency",
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
        version: getDependencyVersion(
          context,
          getMainDependency(definition.name)
        ),
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
    "Spring Boot": "spring-boot-starter-web",
    "Ruby on Rails": "rails",
    Gin: "github.com/gin-gonic/gin",
    Echo: "github.com/labstack/echo",
    Actix: "actix-web",
    Axum: "axum",
    Flutter: "flutter",
  };
  return dependencyMap[frameworkName] || frameworkName.toLowerCase();
}
