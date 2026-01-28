/**
 * Results component
 * Displays generation results
 */

import React from "react";
import { Text, Box } from "ink";
import type { ResultsProps } from "./types.js";
import { StatusMessage } from "./StatusMessage.js";

export function Results({ results }: ResultsProps): React.ReactElement {
  const { success, summary, results: generatorResults } = results;

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Header */}
      <Box marginBottom={1}>
        {success ? (
          <StatusMessage type="success">Generation complete!</StatusMessage>
        ) : (
          <StatusMessage type="error">Generation completed with errors</StatusMessage>
        )}
      </Box>

      {/* Summary */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">Summary</Text>
        <Box marginLeft={2} flexDirection="column">
          {summary.created > 0 && (
            <Text color="green">✓ {summary.created} file(s) created</Text>
          )}
          {summary.modified > 0 && (
            <Text color="yellow">~ {summary.modified} file(s) modified</Text>
          )}
          {summary.skipped > 0 && (
            <Text color="gray">○ {summary.skipped} file(s) skipped</Text>
          )}
          {summary.errors > 0 && (
            <Text color="red">✗ {summary.errors} error(s)</Text>
          )}
        </Box>
      </Box>

      {/* Files by target */}
      {generatorResults.map((result, i) => (
        <Box key={i} flexDirection="column" marginBottom={1}>
          <Text bold>{getTargetLabel(result.target)}</Text>
          <Box marginLeft={2} flexDirection="column">
            {result.files.length === 0 ? (
              <Text color="gray" dimColor>No files generated</Text>
            ) : (
              result.files.map((file, j) => (
                <Box key={j}>
                  <Text color={getActionColor(file.action)}>
                    {getActionIcon(file.action)}{" "}
                  </Text>
                  <Text>{file.path}</Text>
                  {file.error && (
                    <Text color="red" dimColor> ({file.error})</Text>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Box>
      ))}

      {/* Next steps */}
      <Box marginTop={1} flexDirection="column">
        <Text bold color="cyan">Next Steps</Text>
        <Box marginLeft={2} flexDirection="column">
          <Text color="gray">• Review the generated files</Text>
          <Text color="gray">• Customize rules as needed</Text>
          <Text color="gray">• Commit changes to version control</Text>
        </Box>
      </Box>

      {/* Qoder-specific usage guide */}
      {hasQoderTarget(generatorResults) && (
        <Box marginTop={1} flexDirection="column">
          <Box borderStyle="round" borderColor="cyan" paddingX={1} paddingY={1} flexDirection="column">
            <Text bold color="cyan">🎉 Qoder Rules Generated!</Text>
            <Box marginTop={1} flexDirection="column">
              <Text bold color="white">📖 How to Use:</Text>
              <Box marginLeft={2} flexDirection="column" marginTop={1}>
                <Text color="gray">Rules use <Text color="yellow">trigger: manual</Text> - reference with <Text color="green">@rule-name.md</Text></Text>
              </Box>
            </Box>
            <Box marginTop={1} flexDirection="column">
              <Text bold color="white">💡 Quick Start:</Text>
              <Box marginLeft={2} flexDirection="column" marginTop={1}>
                <Text><Text color="cyan">1.</Text> <Text color="green">@quick-reference.md</Text> <Text color="gray">- Complete usage guide</Text></Text>
                <Text><Text color="cyan">2.</Text> <Text color="green">@requirements-spec.md</Text> <Text color="gray">- Quest Mode (no TODOs!)</Text></Text>
                <Text><Text color="cyan">3.</Text> <Text color="green">@security.md</Text> <Text color="gray">- Auth, validation, APIs</Text></Text>
              </Box>
            </Box>
            <Box marginTop={1} flexDirection="column">
              <Text bold color="white">🚀 Example:</Text>
              <Box marginLeft={2} flexDirection="column" marginTop={1}>
                <Text color="gray">"Implement login <Text color="green">@security.md @api-design.md</Text>"</Text>
              </Box>
            </Box>
            <Box marginTop={1}>
              <Text color="yellow">⚠️  Important: </Text>
              <Text color="gray">Always use <Text color="green">@requirements-spec.md</Text> for new features!</Text>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function hasQoderTarget(results: any[]): boolean {
  return results.some(r => r.target === "qoder");
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
