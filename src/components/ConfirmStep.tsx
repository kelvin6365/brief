/**
 * ConfirmStep component
 * Shows summary and asks for confirmation before generating
 */

import React from "react";
import { Text, Box, useInput } from "ink";
import type { WizardState } from "./types.js";

export interface ConfirmStepProps {
  state: WizardState;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmStep({ state, onConfirm, onBack }: ConfirmStepProps): React.ReactElement {
  useInput((input, key) => {
    if (key.return || input === "y" || input === "Y") {
      onConfirm();
    }
    if (key.escape || input === "n" || input === "N") {
      onBack();
    }
  });

  const { config, detection } = state;
  const tools = config.tools || [];
  const templates = config.templates || [];

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="cyan">Confirm Generation</Text>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Configuration Summary:</Text>

        <Box marginLeft={2} marginTop={1} flexDirection="column">
          {/* Tools */}
          <Box>
            <Text color="gray">Tools: </Text>
            <Text>{formatTools(tools)}</Text>
          </Box>

          {/* Language */}
          <Box>
            <Text color="gray">Language: </Text>
            <Text>{detection?.language.primary || "Unknown"}</Text>
          </Box>

          {/* Frameworks */}
          {detection && detection.frameworks.length > 0 && (
            <Box>
              <Text color="gray">Frameworks: </Text>
              <Text>{detection.frameworks.map((f) => f.name).join(", ")}</Text>
            </Box>
          )}

          {/* Templates */}
          <Box>
            <Text color="gray">Templates: </Text>
            <Text>
              {templates.length > 0
                ? templates.length > 3
                  ? `${templates.slice(0, 3).join(", ")} +${templates.length - 3} more`
                  : templates.join(", ")
                : "Auto-detected"}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Files to be created */}
      <Box marginTop={1} flexDirection="column">
        <Text bold>Files to be created:</Text>
        <Box marginLeft={2} flexDirection="column">
          {(tools.includes("cursor") || tools.includes("hybrid")) && (
            <Text color="gray">• .cursor/rules/*.mdc</Text>
          )}
          {(tools.includes("claude") || tools.includes("hybrid")) && (
            <>
              <Text color="gray">• CLAUDE.md</Text>
              <Text color="gray">• .claude/settings.json</Text>
              <Text color="gray">• .claude/skills/*.md</Text>
            </>
          )}
          <Text color="gray">• docs/ARCHITECTURE.md</Text>
          <Text color="gray">• docs/TECH-STACK.md</Text>
        </Box>
      </Box>

      {/* Prompt */}
      <Box marginTop={2}>
        <Text>
          <Text color="green" bold>Proceed with generation?</Text>
          <Text color="gray"> (y/n) </Text>
        </Text>
      </Box>
    </Box>
  );
}

function formatTools(tools: string[]): string {
  if (tools.includes("hybrid")) {
    return "Cursor + Claude Code";
  }
  return tools
    .map((t) => {
      switch (t) {
        case "cursor":
          return "Cursor";
        case "claude":
          return "Claude Code";
        default:
          return t;
      }
    })
    .join(" + ");
}

export default ConfirmStep;
