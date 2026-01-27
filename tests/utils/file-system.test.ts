/**
 * Tests for file system utility
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import fs from "fs-extra";
import path from "path";
import {
  exists,
  isDirectory,
  isFile,
  readFile,
  readJson,
  writeFileSafe,
  writeJsonSafe,
  getBackupPath,
  ensureDir,
  remove,
  glob,
  listDirectory,
  relativePath,
  joinPath,
  resolvePath,
  dirname,
  basename,
  extname,
  isAbsolute,
  normalizePath,
} from "../../src/utils/file-system.js";

const TEST_DIR = path.join(process.cwd(), ".test-temp");

describe("file-system", () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  describe("exists", () => {
    test("returns true for existing file", async () => {
      const filePath = path.join(TEST_DIR, "test.txt");
      await fs.writeFile(filePath, "test");
      expect(await exists(filePath)).toBe(true);
    });

    test("returns false for non-existing file", async () => {
      expect(await exists(path.join(TEST_DIR, "nonexistent.txt"))).toBe(false);
    });
  });

  describe("isDirectory", () => {
    test("returns true for directory", async () => {
      expect(await isDirectory(TEST_DIR)).toBe(true);
    });

    test("returns false for file", async () => {
      const filePath = path.join(TEST_DIR, "test.txt");
      await fs.writeFile(filePath, "test");
      expect(await isDirectory(filePath)).toBe(false);
    });
  });

  describe("isFile", () => {
    test("returns true for file", async () => {
      const filePath = path.join(TEST_DIR, "test.txt");
      await fs.writeFile(filePath, "test");
      expect(await isFile(filePath)).toBe(true);
    });

    test("returns false for directory", async () => {
      expect(await isFile(TEST_DIR)).toBe(false);
    });
  });

  describe("readFile", () => {
    test("reads file content", async () => {
      const filePath = path.join(TEST_DIR, "test.txt");
      await fs.writeFile(filePath, "hello world");
      expect(await readFile(filePath)).toBe("hello world");
    });

    test("returns null for non-existing file", async () => {
      expect(await readFile(path.join(TEST_DIR, "nonexistent.txt"))).toBe(null);
    });
  });

  describe("readJson", () => {
    test("reads and parses JSON file", async () => {
      const filePath = path.join(TEST_DIR, "test.json");
      await fs.writeFile(filePath, '{"name": "test", "version": 1}');
      const data = await readJson<{ name: string; version: number }>(filePath);
      expect(data).toEqual({ name: "test", version: 1 });
    });

    test("returns null for invalid JSON", async () => {
      const filePath = path.join(TEST_DIR, "invalid.json");
      await fs.writeFile(filePath, "not valid json");
      expect(await readJson(filePath)).toBe(null);
    });
  });

  describe("writeFileSafe", () => {
    test("creates new file", async () => {
      const filePath = path.join(TEST_DIR, "new.txt");
      const result = await writeFileSafe(filePath, "content");
      expect(result.success).toBe(true);
      expect(result.action).toBe("created");
      expect(await fs.readFile(filePath, "utf-8")).toBe("content");
    });

    test("modifies existing file", async () => {
      const filePath = path.join(TEST_DIR, "existing.txt");
      await fs.writeFile(filePath, "old content");
      const result = await writeFileSafe(filePath, "new content");
      expect(result.success).toBe(true);
      expect(result.action).toBe("modified");
      expect(await fs.readFile(filePath, "utf-8")).toBe("new content");
    });

    test("skips existing file with skipExisting option", async () => {
      const filePath = path.join(TEST_DIR, "skip.txt");
      await fs.writeFile(filePath, "original");
      const result = await writeFileSafe(filePath, "new", { skipExisting: true });
      expect(result.success).toBe(true);
      expect(result.action).toBe("skipped");
      expect(await fs.readFile(filePath, "utf-8")).toBe("original");
    });

    test("creates backup when backup option is true", async () => {
      const filePath = path.join(TEST_DIR, "backup.txt");
      await fs.writeFile(filePath, "original");
      const result = await writeFileSafe(filePath, "new", { backup: true });
      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(await fs.readFile(result.backupPath!, "utf-8")).toBe("original");
    });

    test("dry run does not write file", async () => {
      const filePath = path.join(TEST_DIR, "dryrun.txt");
      const result = await writeFileSafe(filePath, "content", { dryRun: true });
      expect(result.success).toBe(true);
      expect(result.action).toBe("created");
      expect(await exists(filePath)).toBe(false);
    });
  });

  describe("writeJsonSafe", () => {
    test("writes formatted JSON", async () => {
      const filePath = path.join(TEST_DIR, "data.json");
      const result = await writeJsonSafe(filePath, { name: "test" });
      expect(result.success).toBe(true);
      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toBe('{\n  "name": "test"\n}\n');
    });
  });

  describe("getBackupPath", () => {
    test("generates backup path with timestamp", () => {
      const filePath = "/path/to/file.txt";
      const backupPath = getBackupPath(filePath);
      expect(backupPath).toMatch(/\/path\/to\/file\.backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.txt$/);
    });
  });

  describe("ensureDir", () => {
    test("creates nested directories", async () => {
      const nestedDir = path.join(TEST_DIR, "a", "b", "c");
      await ensureDir(nestedDir);
      expect(await isDirectory(nestedDir)).toBe(true);
    });
  });

  describe("remove", () => {
    test("removes file", async () => {
      const filePath = path.join(TEST_DIR, "remove.txt");
      await fs.writeFile(filePath, "content");
      const result = await remove(filePath);
      expect(result).toBe(true);
      expect(await exists(filePath)).toBe(false);
    });

    test("removes directory recursively", async () => {
      const dirPath = path.join(TEST_DIR, "removedir");
      await fs.ensureDir(path.join(dirPath, "subdir"));
      await fs.writeFile(path.join(dirPath, "file.txt"), "content");
      const result = await remove(dirPath);
      expect(result).toBe(true);
      expect(await exists(dirPath)).toBe(false);
    });
  });

  describe("glob", () => {
    test("finds files matching pattern", async () => {
      await fs.writeFile(path.join(TEST_DIR, "a.ts"), "");
      await fs.writeFile(path.join(TEST_DIR, "b.ts"), "");
      await fs.writeFile(path.join(TEST_DIR, "c.js"), "");
      const files = await glob("*.ts", { cwd: TEST_DIR });
      expect(files.sort()).toEqual(["a.ts", "b.ts"]);
    });
  });

  describe("listDirectory", () => {
    test("lists files and directories", async () => {
      await fs.writeFile(path.join(TEST_DIR, "file.txt"), "");
      await fs.ensureDir(path.join(TEST_DIR, "subdir"));
      const contents = await listDirectory(TEST_DIR);
      expect(contents.files).toContain("file.txt");
      expect(contents.directories).toContain("subdir");
    });
  });

  describe("path utilities", () => {
    test("relativePath", () => {
      expect(relativePath("/a/b", "/a/b/c/d.txt")).toBe("c/d.txt");
    });

    test("joinPath", () => {
      expect(joinPath("a", "b", "c")).toBe("a/b/c");
    });

    test("resolvePath", () => {
      expect(resolvePath("/a", "b", "c")).toBe("/a/b/c");
    });

    test("dirname", () => {
      expect(dirname("/a/b/c.txt")).toBe("/a/b");
    });

    test("basename", () => {
      expect(basename("/a/b/c.txt")).toBe("c.txt");
      expect(basename("/a/b/c.txt", ".txt")).toBe("c");
    });

    test("extname", () => {
      expect(extname("/a/b/c.txt")).toBe(".txt");
    });

    test("isAbsolute", () => {
      expect(isAbsolute("/a/b")).toBe(true);
      expect(isAbsolute("a/b")).toBe(false);
    });

    test("normalizePath", () => {
      expect(normalizePath("/a/b/../c")).toBe("/a/c");
    });
  });
});
