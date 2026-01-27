import { describe, it, expect } from "bun:test";
import { detectFrameworks } from "../../src/detectors/framework.js";
import type { DetectionContext } from "../../src/detectors/types.js";

function createContext(overrides: Partial<DetectionContext> = {}): DetectionContext {
  return {
    projectPath: "/test",
    files: [],
    packageJson: null,
    pythonRequirements: [],
    goMod: false,
    cargoToml: false,
    ...overrides,
  };
}

describe("detectFrameworks", () => {
  describe("React detection", () => {
    it("detects React from dependency", () => {
      const context = createContext({
        packageJson: {
          dependencies: { react: "^18.0.0" },
        },
        files: ["src/App.tsx"],
      });

      const frameworks = detectFrameworks(context);

      expect(frameworks.some((f) => f.name === "React")).toBe(true);
    });
  });

  describe("Next.js detection", () => {
    it("detects Next.js from dependency", () => {
      const context = createContext({
        packageJson: {
          dependencies: { next: "^14.0.0", react: "^18.0.0" },
        },
        files: ["next.config.js", "app/page.tsx"],
      });

      const frameworks = detectFrameworks(context);

      const nextjs = frameworks.find((f) => f.name === "Next.js");
      expect(nextjs).toBeDefined();
      expect(nextjs?.confidence).toBeGreaterThan(90);
    });

    it("gives higher confidence with config file", () => {
      const withConfig = createContext({
        packageJson: { dependencies: { next: "^14.0.0" } },
        files: ["next.config.js"],
      });
      const withoutConfig = createContext({
        packageJson: { dependencies: { next: "^14.0.0" } },
        files: [],
      });

      const resultWith = detectFrameworks(withConfig);
      const resultWithout = detectFrameworks(withoutConfig);

      const confWith = resultWith.find((f) => f.name === "Next.js")?.confidence ?? 0;
      const confWithout = resultWithout.find((f) => f.name === "Next.js")?.confidence ?? 0;

      expect(confWith).toBeGreaterThan(confWithout);
    });
  });

  describe("Vue detection", () => {
    it("detects Vue from dependency and .vue files", () => {
      const context = createContext({
        packageJson: {
          dependencies: { vue: "^3.0.0" },
        },
        files: ["src/App.vue", "src/components/Hello.vue"],
      });

      const frameworks = detectFrameworks(context);

      expect(frameworks.some((f) => f.name === "Vue")).toBe(true);
    });
  });

  describe("Express detection", () => {
    it("detects Express from dependency", () => {
      const context = createContext({
        packageJson: {
          dependencies: { express: "^4.18.0" },
        },
      });

      const frameworks = detectFrameworks(context);

      const express = frameworks.find((f) => f.name === "Express");
      expect(express).toBeDefined();
      expect(express?.category).toBe("backend");
    });
  });

  describe("Python frameworks", () => {
    it("detects FastAPI", () => {
      const context = createContext({
        pythonRequirements: ["fastapi", "uvicorn"],
        files: ["main.py"],
      });

      const frameworks = detectFrameworks(context);

      expect(frameworks.some((f) => f.name === "FastAPI")).toBe(true);
    });

    it("detects Django with manage.py", () => {
      const context = createContext({
        pythonRequirements: ["django"],
        files: ["manage.py", "myapp/views.py"],
      });

      const frameworks = detectFrameworks(context);

      const django = frameworks.find((f) => f.name === "Django");
      expect(django).toBeDefined();
      expect(django?.confidence).toBeGreaterThan(90);
    });

    it("detects Flask", () => {
      const context = createContext({
        pythonRequirements: ["flask"],
        files: ["app.py"],
      });

      const frameworks = detectFrameworks(context);

      expect(frameworks.some((f) => f.name === "Flask")).toBe(true);
    });
  });

  describe("multiple frameworks", () => {
    it("detects multiple frameworks in fullstack project", () => {
      const context = createContext({
        packageJson: {
          dependencies: {
            next: "^14.0.0",
            react: "^18.0.0",
          },
        },
        files: ["next.config.js", "app/page.tsx"],
      });

      const frameworks = detectFrameworks(context);

      expect(frameworks.length).toBeGreaterThanOrEqual(2);
      expect(frameworks.some((f) => f.name === "Next.js")).toBe(true);
      expect(frameworks.some((f) => f.name === "React")).toBe(true);
    });
  });

  describe("empty project", () => {
    it("returns empty array for empty project", () => {
      const context = createContext();

      const frameworks = detectFrameworks(context);

      expect(frameworks).toEqual([]);
    });
  });
});
