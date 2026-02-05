/**
 * Results component
 * Displays generation results
 */

import React from "react";
import { Text, Box } from "ink";
import type { ResultsProps } from "./types.js";

export function Results({ results }: ResultsProps): React.ReactElement {
  const { success, summary, results: generatorResults } = results;

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box
        borderStyle="round"
        borderColor={success ? "green" : "red"}
        paddingX={2}
        paddingY={1}
        marginBottom={1}
      >
        {success ? (
          <Box>
            <Text bold color="green">
              🎉 Generation Complete!
            </Text>
          </Box>
        ) : (
          <Box>
            <Text bold color="red">
              ⚠️ Generation Completed with Errors
            </Text>
          </Box>
        )}

        {/* Summary */}
        <Box flexDirection="column" marginTop={1}>
          <Box>
            {summary.created > 0 && (
              <Text color="green">✓ {summary.created} created</Text>
            )}
            {summary.modified > 0 && (
              <>
                <Text color="gray"> · </Text>
                <Text color="yellow">~ {summary.modified} modified</Text>
              </>
            )}
            {summary.skipped > 0 && (
              <>
                <Text color="gray"> · </Text>
                <Text color="gray">○ {summary.skipped} skipped</Text>
              </>
            )}
            {summary.errors > 0 && (
              <>
                <Text color="gray"> · </Text>
                <Text color="red">✗ {summary.errors} errors</Text>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Files by target */}
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Text bold color="cyan">
          📁 Generated Files
        </Text>

        {generatorResults.map((result, i) => (
          <Box key={i} flexDirection="column" marginTop={1}>
            <Text bold color="white">
              {getTargetLabel(result.target)}
            </Text>
            <Box marginLeft={2} flexDirection="column">
              {result.files.length === 0 ? (
                <Text color="gray" dimColor>
                  No files generated
                </Text>
              ) : (
                result.files.map((file, j) => (
                  <Box key={j}>
                    <Text color={getActionColor(file.action)}>
                      {getActionIcon(file.action)}{" "}
                    </Text>
                    <Text color="gray">{file.path}</Text>
                    {file.error && (
                      <Text color="red" dimColor>
                        {" "}
                        ({file.error})
                      </Text>
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Next steps */}
      <Box
        borderStyle="round"
        borderColor="magenta"
        paddingX={2}
        paddingY={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Text bold color="magenta">
          🚀 Next Steps
        </Text>
        <Box marginTop={1} flexDirection="column">
          <Text color="white">1. Review the generated files</Text>
          <Text color="white">2. Customize rules as needed</Text>
          <Text color="white">3. Commit changes to version control</Text>
        </Box>
      </Box>

      {/* Qoder-specific usage guide */}
      {hasQoderTarget(generatorResults) && (
        <Box marginTop={1} flexDirection="column">
          <Box
            borderStyle="round"
            borderColor="cyan"
            paddingX={1}
            paddingY={1}
            flexDirection="column"
          >
            <Text bold color="cyan">
              🎉 Qoder Rules Generated!
            </Text>
            <Box marginTop={1} flexDirection="column">
              <Text bold color="white">
                📖 How to Activate:
              </Text>
              <Box marginLeft={2} flexDirection="column" marginTop={1}>
                <Text color="gray">
                  Right-click rules in Qoder IDE → Settings → Choose mode
                </Text>
              </Box>
            </Box>
            <Box marginTop={1} flexDirection="column">
              <Text bold color="white">
                💡 Recommended:
              </Text>
              <Box marginLeft={2} flexDirection="column" marginTop={1}>
                <Text>
                  <Text color="cyan">1.</Text>{" "}
                  <Text color="green">quick-reference.md</Text>{" "}
                  <Text color="gray">- Complete usage guide</Text>
                </Text>
                <Text>
                  <Text color="cyan">2.</Text>{" "}
                  <Text color="green">requirements-spec.md</Text>{" "}
                  <Text color="gray">- Always Apply (no TODOs!)</Text>
                </Text>
                <Text>
                  <Text color="cyan">3.</Text>{" "}
                  <Text color="green">security.md</Text>{" "}
                  <Text color="gray">- Model Decision (auto-security)</Text>
                </Text>
              </Box>
            </Box>
            <Box marginTop={1}>
              <Text color="yellow">⚠️ Limit: </Text>
              <Text color="gray">
                Keep active rules under 100K characters
              </Text>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function hasQoderTarget(results: any[]): boolean {
  return results.some((r) => r.target === "qoder");
}

function getTargetLabel(target: string): string {
  switch (target) {
    case "cursor":
      return "Cursor Rules (.cursor/rules/)";
    case "claude":
      return "Claude Code (CLAUDE.md, .claude/)";
    case "qoder":
      return "Qoder Rules (.qoder/rules/)";
    case "shared":
      return "Documentation (docs/)";
    default:
      return target;
  }
}

function getActionColor(action: string): string {
  switch (action) {
    case "created":
      return "green";
    case "modified":
      return "yellow";
    case "skipped":
      return "gray";
    case "error":
      return "red";
    default:
      return "white";
  }
}

function getActionIcon(action: string): string {
  switch (action) {
    case "created":
      return "+";
    case "modified":
      return "~";
    case "skipped":
      return "○";
    case "error":
      return "✗";
    default:
      return " ";
  }
}

export default Results;
