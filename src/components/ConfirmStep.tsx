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
    <Box
      borderStyle="round"
      borderColor="yellow"
      paddingX={2}
      paddingY={1}
      flexDirection="column"
    >
      <Box marginBottom={1}>
        <Text bold color="yellow">✓ Confirm Generation</Text>
      </Box>

      {/* Configuration Summary */}
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">📋 Configuration Summary</Text>

        <Box marginLeft={2} marginTop={1} flexDirection="column">
          {/* Tools */}
          <Box>
            <Text color="gray">🛠️  Tools: </Text>
            <Text color="white">{formatTools(tools)}</Text>
          </Box>

          {/* Language */}
          <Box>
            <Text color="gray">💬 Language: </Text>
            <Text color="white">{detection?.language.primary || "Unknown"}</Text>
          </Box>

          {/* Frameworks */}
          {detection && detection.frameworks.length > 0 && (
            <Box>
              <Text color="gray">⚡ Frameworks: </Text>
              <Text color="white">{detection.frameworks.map((f) => f.name).join(", ")}</Text>
            </Box>
          )}

          {/* Templates */}
          <Box>
            <Text color="gray">📄 Templates: </Text>
            <Text color="white">
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
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">📁 Files to be created</Text>
        <Box marginLeft={2} marginTop={1} flexDirection="column">
          {(tools.includes("cursor") || tools.includes("hybrid")) && (
            <Text color="green">✓ .cursor/rules/*.mdc</Text>
          )}
          {(tools.includes("claude") || tools.includes("hybrid")) && (
            <>
              <Text color="green">✓ CLAUDE.md</Text>
              <Text color="green">✓ .claude/settings.json</Text>
              <Text color="green">✓ .claude/skills/*.md</Text>
            </>
          )}
          {tools.includes("qoder") && (
            <Text color="green">✓ .qoder/rules/*.md</Text>
          )}
          <Text color="green">✓ docs/ARCHITECTURE.md</Text>
          <Text color="green">✓ docs/TECH-STACK.md</Text>
        </Box>
      </Box>

      {/* Prompt */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="green" bold>Proceed? </Text>
        <Text color="gray">[</Text>
        <Text color="green">Y</Text>
        <Text color="gray">/</Text>
        <Text color="red">n</Text>
        <Text color="gray">]</Text>
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
