/**
 * Tests for template engine utility
 */

import { describe, test, expect } from "bun:test";
import {
  renderTemplate,
  parseFrontmatter,
  generateFrontmatter,
  compileTemplate,
  createTemplateContext,
} from "../../src/utils/template-engine.js";

describe("template-engine", () => {
  describe("renderTemplate", () => {
    test("renders simple variables", () => {
      const result = renderTemplate("Hello {{name}}!", { name: "World" } as any);
      expect(result).toBe("Hello World!");
    });

    test("renders nested variables", () => {
      const result = renderTemplate("{{project.name}} v{{project.version}}", {
        project: { name: "test", type: "cli", language: "typescript" },
      } as any);
      expect(result).toBe("test v");
    });

    test("handles missing variables gracefully", () => {
      const result = renderTemplate("Hello {{missing}}!", {} as any);
      expect(result).toBe("Hello !");
    });
  });

  describe("helpers", () => {
    test("eq helper", () => {
      expect(renderTemplate("{{#if (eq a b)}}yes{{else}}no{{/if}}", { a: 1, b: 1 } as any)).toBe("yes");
      expect(renderTemplate("{{#if (eq a b)}}yes{{else}}no{{/if}}", { a: 1, b: 2 } as any)).toBe("no");
    });

    test("and helper", () => {
      expect(renderTemplate("{{#if (and a b)}}yes{{else}}no{{/if}}", { a: true, b: true } as any)).toBe("yes");
      expect(renderTemplate("{{#if (and a b)}}yes{{else}}no{{/if}}", { a: true, b: false } as any)).toBe("no");
    });

    test("or helper", () => {
      expect(renderTemplate("{{#if (or a b)}}yes{{else}}no{{/if}}", { a: false, b: true } as any)).toBe("yes");
      expect(renderTemplate("{{#if (or a b)}}yes{{else}}no{{/if}}", { a: false, b: false } as any)).toBe("no");
    });

    test("includes helper", () => {
      expect(renderTemplate("{{#if (includes arr 2)}}yes{{else}}no{{/if}}", { arr: [1, 2, 3] } as any)).toBe("yes");
      expect(renderTemplate("{{#if (includes arr 5)}}yes{{else}}no{{/if}}", { arr: [1, 2, 3] } as any)).toBe("no");
    });

    test("join helper", () => {
      expect(renderTemplate("{{join arr \", \"}}", { arr: ["a", "b", "c"] } as any)).toBe("a, b, c");
    });

    test("lowercase helper", () => {
      expect(renderTemplate("{{lowercase str}}", { str: "HELLO" } as any)).toBe("hello");
    });

    test("uppercase helper", () => {
      expect(renderTemplate("{{uppercase str}}", { str: "hello" } as any)).toBe("HELLO");
    });

    test("capitalize helper", () => {
      expect(renderTemplate("{{capitalize str}}", { str: "hello" } as any)).toBe("Hello");
    });

    test("kebabCase helper", () => {
      expect(renderTemplate("{{kebabCase str}}", { str: "helloWorld" } as any)).toBe("hello-world");
    });

    test("camelCase helper", () => {
      expect(renderTemplate("{{camelCase str}}", { str: "hello-world" } as any)).toBe("helloWorld");
    });

    test("pascalCase helper", () => {
      expect(renderTemplate("{{pascalCase str}}", { str: "hello-world" } as any)).toBe("HelloWorld");
    });

    test("json helper", () => {
      expect(renderTemplate("{{json obj}}", { obj: { a: 1 } } as any)).toBe('{\n  "a": 1\n}');
    });

    test("length helper", () => {
      expect(renderTemplate("{{length arr}}", { arr: [1, 2, 3] } as any)).toBe("3");
    });

    test("first helper", () => {
      expect(renderTemplate("{{first arr}}", { arr: [1, 2, 3] } as any)).toBe("1");
    });

    test("last helper", () => {
      expect(renderTemplate("{{last arr}}", { arr: [1, 2, 3] } as any)).toBe("3");
    });
  });

  describe("parseFrontmatter", () => {
    test("parses YAML frontmatter", () => {
      const content = `---
name: test
globs:
  - "**/*.ts"
priority: 100
---

# Content here`;

      const { frontmatter, content: body } = parseFrontmatter(content);
      expect(frontmatter.name).toBe("test");
      expect(frontmatter.globs).toEqual(["**/*.ts"]);
      expect(frontmatter.priority).toBe(100);
      expect(body).toBe("# Content here");
    });

    test("handles content without frontmatter", () => {
      const content = "# Just content\nNo frontmatter here";
      const { frontmatter, content: body } = parseFrontmatter(content);
      expect(frontmatter).toEqual({});
      expect(body).toBe("# Just content\nNo frontmatter here");
    });

    test("handles empty frontmatter", () => {
      // Note: Empty frontmatter needs at least one newline between markers
      const content = `---

---

Content`;
      const { frontmatter, content: body } = parseFrontmatter(content);
      expect(frontmatter).toEqual({});
      expect(body).toBe("Content");
    });
  });

  describe("generateFrontmatter", () => {
    test("generates YAML frontmatter", () => {
      const frontmatter = generateFrontmatter({
        name: "test",
        globs: ["**/*.ts"],
        priority: 100,
      });
      expect(frontmatter).toContain("name: test");
      expect(frontmatter).toContain("priority: 100");
      expect(frontmatter).toMatch(/^---\n/);
      expect(frontmatter).toMatch(/---\n\n$/);
    });

    test("returns empty string for empty object", () => {
      expect(generateFrontmatter({})).toBe("");
    });
  });

  describe("compileTemplate", () => {
    test("compiles and caches template", () => {
      const template = compileTemplate("Hello {{name}}!");
      expect(template({ name: "World" })).toBe("Hello World!");
    });
  });

  describe("createTemplateContext", () => {
    test("creates context with all required fields", () => {
      const context = createTemplateContext(
        "my-project",
        {
          frameworks: [{ name: "React", version: "18.2.0", confidence: 0.9 }],
          testing: "jest",
          database: "postgresql",
          packageManager: "bun",
        },
        {
          tools: ["cursor", "claude"],
          templates: ["react", "testing"],
        },
        "1.0.0"
      );

      expect(context.project.name).toBe("my-project");
      expect(context.project.framework).toBe("React");
      expect(context.detection.frameworks).toHaveLength(1);
      expect(context.detection.testing).toBe("jest");
      expect(context.config.tools).toContain("cursor");
      expect(context.generated.version).toBe("1.0.0");
      expect(context.generated.date).toBeDefined();
    });
  });
});
