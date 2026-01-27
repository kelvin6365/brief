/**
 * Tests for detect command
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import path from "node:path";
import fs from "fs-extra";
import { detectCommand } from "../../src/commands/detect.js";

describe("detect command", () => {
  const testDir = path.join(process.cwd(), "test-temp-detect");

  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  test("detects TypeScript project", async () => {
    // Create a TypeScript project structure
    await fs.writeJson(path.join(testDir, "package.json"), {
      name: "test-project",
      dependencies: {},
      devDependencies: {
        typescript: "^5.0.0",
      },
    });
    await fs.writeFile(path.join(testDir, "tsconfig.json"), "{}");

    // Capture console output
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      const result = await detectCommand({
        path: testDir,
        json: false,
      });

      expect(result.success).toBe(true);
      expect(logs.some(log => log.includes("Project Detection Results"))).toBe(true);
    } finally {
      console.log = originalLog;
    }
  });

  test("outputs JSON when json option is true", async () => {
    await fs.writeJson(path.join(testDir, "package.json"), {
      name: "test-project",
    });

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(String(msg));

    try {
      const result = await detectCommand({
        path: testDir,
        json: true,
      });

      expect(result.success).toBe(true);
      // Find the JSON output (filter out log messages that start with "[detect]")
      const jsonOutput = logs.find(log => !log.startsWith("[detect]") && log.startsWith("{"));
      expect(jsonOutput).toBeDefined();
      if (jsonOutput) {
        expect(() => JSON.parse(jsonOutput)).not.toThrow();
      }
    } finally {
      console.log = originalLog;
    }
  });

  test("handles empty directory gracefully", async () => {
    // Create an empty directory
    const emptyDir = path.join(testDir, "empty");
    await fs.ensureDir(emptyDir);

    const result = await detectCommand({
      path: emptyDir,
      json: false,
    });

    // Detection should succeed even for empty directories
    expect(result.success).toBe(true);
  });

  test("returns verbose output when verbose option is true", async () => {
    await fs.writeJson(path.join(testDir, "package.json"), {
      name: "test-project",
      devDependencies: {
        typescript: "^5.0.0",
      },
    });
    await fs.writeFile(path.join(testDir, "tsconfig.json"), "{}");

    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(String(msg));

    try {
      const result = await detectCommand({
        path: testDir,
        json: false,
        verbose: true,
      });

      expect(result.success).toBe(true);
      expect(logs.some(log => log.includes("Detailed Information"))).toBe(true);
    } finally {
      console.log = originalLog;
    }
  });
});
