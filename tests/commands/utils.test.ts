/**
 * Tests for command utilities
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import path from "node:path";
import fs from "fs-extra";
import {
  loadProjectConfig,
  saveProjectConfig,
  isInitialized,
  formatBytes,
  formatDuration,
  parseTool,
} from "../../src/commands/utils.js";
import type { AiInitConfig } from "../../src/types/index.js";

describe("command utils", () => {
  const testDir = path.join(process.cwd(), "test-temp-cmd-utils");

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe("loadProjectConfig", () => {
    test("returns null when config does not exist", async () => {
      const result = await loadProjectConfig(testDir);
      expect(result).toBeNull();
    });

    test("loads valid config file", async () => {
      const config: AiInitConfig = {
        version: "1.0.0",
        projectType: "app",
        language: "typescript",
        tools: ["hybrid"],
        templates: ["testing"],
      };
      await fs.writeJson(path.join(testDir, ".brief.json"), config);

      const result = await loadProjectConfig(testDir);
      expect(result).toEqual(config);
    });

    test("returns null for invalid JSON", async () => {
      await fs.writeFile(
        path.join(testDir, ".brief-init.json"),
        "not valid json"
      );
      const result = await loadProjectConfig(testDir);
      expect(result).toBeNull();
    });
  });

  describe("saveProjectConfig", () => {
    test("saves config to file", async () => {
      const config: AiInitConfig = {
        version: "1.0.0",
        projectType: "library",
        language: "python",
        tools: ["claude"],
        templates: [],
      };

      await saveProjectConfig(testDir, config);

      const savedPath = path.join(testDir, ".brief.json");
      expect(await fs.pathExists(savedPath)).toBe(true);

      const content = await fs.readJson(savedPath);
      expect(content).toEqual(config);
    });
  });

  describe("isInitialized", () => {
    test("returns false when not initialized", async () => {
      const result = await isInitialized(testDir);
      expect(result).toBe(false);
    });

    test("returns true when initialized", async () => {
      const config: AiInitConfig = {
        version: "1.0.0",
        projectType: "app",
        language: "typescript",
        tools: ["hybrid"],
        templates: [],
      };
      await fs.writeJson(path.join(testDir, ".brief.json"), config);

      const result = await isInitialized(testDir);
      expect(result).toBe(true);
    });
  });

  describe("formatBytes", () => {
    test("formats zero bytes", () => {
      expect(formatBytes(0)).toBe("0 B");
    });

    test("formats bytes", () => {
      expect(formatBytes(512)).toBe("512 B");
    });

    test("formats kilobytes", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(2560)).toBe("2.5 KB");
    });

    test("formats megabytes", () => {
      expect(formatBytes(1048576)).toBe("1 MB");
    });

    test("formats gigabytes", () => {
      expect(formatBytes(1073741824)).toBe("1 GB");
    });
  });

  describe("formatDuration", () => {
    test("formats milliseconds", () => {
      expect(formatDuration(500)).toBe("500ms");
    });

    test("formats seconds", () => {
      expect(formatDuration(1500)).toBe("1.5s");
      expect(formatDuration(30000)).toBe("30.0s");
    });

    test("formats minutes", () => {
      expect(formatDuration(90000)).toBe("1.5m");
    });
  });

  describe("parseTool", () => {
    test("parses cursor", () => {
      expect(parseTool("cursor")).toBe("cursor");
      expect(parseTool("CURSOR")).toBe("cursor");
      expect(parseTool("  cursor  ")).toBe("cursor");
    });

    test("parses claude", () => {
      expect(parseTool("claude")).toBe("claude");
      expect(parseTool("CLAUDE")).toBe("claude");
    });

    test("parses hybrid", () => {
      expect(parseTool("hybrid")).toBe("hybrid");
      expect(parseTool("HYBRID")).toBe("hybrid");
    });

    test("throws for invalid tool", () => {
      expect(() => parseTool("invalid")).toThrow("Invalid tool: invalid");
      expect(() => parseTool("vscode")).toThrow("Invalid tool: vscode");
    });
  });
});
