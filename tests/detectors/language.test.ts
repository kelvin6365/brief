import { describe, it, expect } from "bun:test";
import { detectLanguage } from "../../src/detectors/language.js";
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

describe("detectLanguage", () => {
  describe("TypeScript detection", () => {
    it("detects TypeScript from tsconfig.json", () => {
      const context = createContext({
        files: ["tsconfig.json", "src/index.ts"],
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("typescript");
      expect(result.confidence).toBeGreaterThan(30);
    });

    it("detects TypeScript from typescript dependency", () => {
      const context = createContext({
        packageJson: {
          devDependencies: { typescript: "^5.0.0" },
        },
        files: ["src/index.ts"],
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("typescript");
    });

    it("prioritizes TypeScript over JavaScript when both present", () => {
      const context = createContext({
        files: [
          "tsconfig.json",
          "src/index.ts",
          // Include enough JS files to pass the secondary threshold (score > 20)
          "scripts/build.js",
          "scripts/deploy.js",
          "scripts/test.js",
          "scripts/lint.js",
          "scripts/format.js",
          "scripts/setup.js",
          "scripts/clean.js",
          "scripts/watch.js",
          "scripts/dev.js",
          "scripts/start.js",
          "scripts/config.js",
        ],
        packageJson: {
          devDependencies: { typescript: "^5.0.0" },
        },
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("typescript");
      expect(result.secondary).toContain("javascript");
    });
  });

  describe("JavaScript detection", () => {
    it("detects JavaScript from .js files", () => {
      const context = createContext({
        files: ["src/index.js", "src/utils.js", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("javascript");
    });
  });

  describe("Python detection", () => {
    it("detects Python from requirements.txt", () => {
      const context = createContext({
        files: ["requirements.txt", "app.py"],
        pythonRequirements: ["django", "requests"],
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("python");
    });

    it("detects Python from pyproject.toml", () => {
      const context = createContext({
        files: ["pyproject.toml", "src/main.py"],
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("python");
    });

    it("detects Python from setup.py", () => {
      const context = createContext({
        files: ["setup.py", "mypackage/__init__.py"],
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("python");
    });
  });

  describe("Go detection", () => {
    it("detects Go from go.mod", () => {
      const context = createContext({
        files: ["main.go"],
        goMod: true,
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("go");
    });
  });

  describe("Rust detection", () => {
    it("detects Rust from Cargo.toml", () => {
      const context = createContext({
        files: ["src/main.rs"],
        cargoToml: true,
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("rust");
    });
  });

  describe("Java detection", () => {
    it("detects Java from pom.xml", () => {
      const context = createContext({
        files: ["pom.xml", "src/main/java/App.java"],
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("java");
    });

    it("detects Java from build.gradle", () => {
      const context = createContext({
        files: ["build.gradle", "src/main/java/App.java"],
      });

      const result = detectLanguage(context);

      expect(result.primary).toBe("java");
    });
  });

  describe("unknown language", () => {
    it("returns unknown for empty project", () => {
      const context = createContext();

      const result = detectLanguage(context);

      expect(result.primary).toBe("unknown");
      expect(result.confidence).toBe(0);
    });
  });
});
