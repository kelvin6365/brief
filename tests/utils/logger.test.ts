/**
 * Tests for logger utility
 */

import { describe, test, expect, beforeEach, spyOn } from "bun:test";
import {
  configureLogger,
  getLogLevel,
  isLevelEnabled,
  createLogger,
} from "../../src/utils/logger.js";

describe("logger", () => {
  beforeEach(() => {
    // Reset to default level
    configureLogger({ level: "info" });
  });

  describe("configureLogger", () => {
    test("sets log level", () => {
      configureLogger({ level: "debug" });
      expect(getLogLevel()).toBe("debug");

      configureLogger({ level: "error" });
      expect(getLogLevel()).toBe("error");
    });
  });

  describe("isLevelEnabled", () => {
    test("debug level enables all levels", () => {
      configureLogger({ level: "debug" });
      expect(isLevelEnabled("debug")).toBe(true);
      expect(isLevelEnabled("info")).toBe(true);
      expect(isLevelEnabled("warn")).toBe(true);
      expect(isLevelEnabled("error")).toBe(true);
    });

    test("info level disables debug", () => {
      configureLogger({ level: "info" });
      expect(isLevelEnabled("debug")).toBe(false);
      expect(isLevelEnabled("info")).toBe(true);
      expect(isLevelEnabled("warn")).toBe(true);
      expect(isLevelEnabled("error")).toBe(true);
    });

    test("error level disables debug, info, warn", () => {
      configureLogger({ level: "error" });
      expect(isLevelEnabled("debug")).toBe(false);
      expect(isLevelEnabled("info")).toBe(false);
      expect(isLevelEnabled("warn")).toBe(false);
      expect(isLevelEnabled("error")).toBe(true);
    });

    test("silent level disables all logging", () => {
      configureLogger({ level: "silent" });
      expect(isLevelEnabled("debug")).toBe(false);
      expect(isLevelEnabled("info")).toBe(false);
      expect(isLevelEnabled("warn")).toBe(false);
      expect(isLevelEnabled("error")).toBe(false);
    });
  });

  describe("createLogger", () => {
    test("creates a scoped logger with prefix", () => {
      const scopedLogger = createLogger("test");
      expect(scopedLogger).toHaveProperty("debug");
      expect(scopedLogger).toHaveProperty("info");
      expect(scopedLogger).toHaveProperty("success");
      expect(scopedLogger).toHaveProperty("warn");
      expect(scopedLogger).toHaveProperty("error");
    });
  });
});
