import { describe, it, expect } from "bun:test";
import { detectPackageManager } from "../../src/detectors/package-manager.js";
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

describe("detectPackageManager", () => {
  describe("Bun detection", () => {
    it("detects Bun from bun.lockb", () => {
      const context = createContext({
        files: ["bun.lockb", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("bun");
      expect(result.lockFile).toBe("bun.lockb");
      expect(result.confidence).toBe(100);
    });

    it("detects Bun from bun.lock", () => {
      const context = createContext({
        files: ["bun.lock", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("bun");
      expect(result.lockFile).toBe("bun.lock");
    });

    it("detects Bun from bunfig.toml", () => {
      const context = createContext({
        files: ["bunfig.toml", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("bun");
      expect(result.confidence).toBe(80);
    });
  });

  describe("pnpm detection", () => {
    it("detects pnpm from pnpm-lock.yaml", () => {
      const context = createContext({
        files: ["pnpm-lock.yaml", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("pnpm");
      expect(result.lockFile).toBe("pnpm-lock.yaml");
      expect(result.confidence).toBe(100);
    });

    it("detects pnpm from pnpm-workspace.yaml", () => {
      const context = createContext({
        files: ["pnpm-workspace.yaml", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("pnpm");
    });
  });

  describe("Yarn detection", () => {
    it("detects Yarn from yarn.lock", () => {
      const context = createContext({
        files: ["yarn.lock", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("yarn");
      expect(result.lockFile).toBe("yarn.lock");
      expect(result.confidence).toBe(100);
    });

    it("detects Yarn from .yarnrc.yml", () => {
      const context = createContext({
        files: [".yarnrc.yml", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("yarn");
    });
  });

  describe("npm detection", () => {
    it("detects npm from package-lock.json", () => {
      const context = createContext({
        files: ["package-lock.json", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("npm");
      expect(result.lockFile).toBe("package-lock.json");
      expect(result.confidence).toBe(100);
    });

    it("falls back to npm when only package.json exists", () => {
      const context = createContext({
        files: ["package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("npm");
      expect(result.confidence).toBe(30);
    });
  });

  describe("unknown detection", () => {
    it("returns unknown for non-JS project", () => {
      const context = createContext({
        files: ["main.py", "requirements.txt"],
        pythonRequirements: ["django"],
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("unknown");
      expect(result.confidence).toBe(0);
    });
  });

  describe("priority", () => {
    it("prioritizes Bun over other lock files", () => {
      const context = createContext({
        files: ["bun.lockb", "package-lock.json", "package.json"],
        packageJson: { name: "test" },
      });

      const result = detectPackageManager(context);

      expect(result.name).toBe("bun");
    });
  });
});
