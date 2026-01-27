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
    </Box>
  );
}

function getTargetLabel(target: string): string {
  switch (target) {
    case "cursor":
      return "Cursor Rules (.cursor/rules/)";
    case "claude":
      return "Claude Code (CLAUDE.md, .claude/)";
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
