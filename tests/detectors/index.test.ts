import { describe, it, expect } from "bun:test";
import { detectProject, getDetectionSummary } from "../../src/detectors/index.js";
import * as path from "path";

describe("detectProject", () => {
  it("detects the aide project itself", async () => {
    const projectPath = path.resolve(import.meta.dir, "../..");
    const result = await detectProject(projectPath);

    // Should detect TypeScript
    expect(result.language.primary).toBe("typescript");
    expect(result.language.confidence).toBeGreaterThan(50);

    // Should detect Bun
    expect(result.packageManager.name).toBe("bun");

    // Should detect React (Ink uses React)
    expect(result.frameworks.some((f) => f.name === "React")).toBe(true);

    // Should detect existing Claude config (CLAUDE.md exists)
    expect(result.aiConfig.claude.hasClaudeMd).toBe(true);
  });

  it("returns detection structure with all fields", async () => {
    const projectPath = path.resolve(import.meta.dir, "../..");
    const result = await detectProject(projectPath);

    // Verify structure
    expect(result).toHaveProperty("language");
    expect(result).toHaveProperty("packageManager");
    expect(result).toHaveProperty("frameworks");
    expect(result).toHaveProperty("testing");
    expect(result).toHaveProperty("database");
    expect(result).toHaveProperty("buildTools");
    expect(result).toHaveProperty("styling");
    expect(result).toHaveProperty("aiConfig");

    // Verify nested structure
    expect(result.language).toHaveProperty("primary");
    expect(result.language).toHaveProperty("confidence");
    expect(result.packageManager).toHaveProperty("name");
    expect(result.aiConfig).toHaveProperty("cursor");
    expect(result.aiConfig).toHaveProperty("claude");
    expect(result.aiConfig).toHaveProperty("copilot");
  });
});

describe("getDetectionSummary", () => {
  it("generates a readable summary", async () => {
    const projectPath = path.resolve(import.meta.dir, "../..");
    const detection = await detectProject(projectPath);
    const summary = getDetectionSummary(detection);

    // Should contain key information
    expect(summary).toContain("Language:");
    expect(summary).toContain("typescript");
    expect(summary).toContain("Package Manager:");
    expect(summary).toContain("bun");
  });
});
