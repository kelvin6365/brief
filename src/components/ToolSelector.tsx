/**
 * ToolSelector component
 * Allows user to select which AI tools to configure
 */

import React from "react";
import { Box, Text } from "ink";
import { SelectList } from "./SelectList.js";
import type { ToolSelectorProps, SelectOption } from "./types.js";

const TOOL_OPTIONS: SelectOption[] = [
  {
    label: "Cursor",
    value: "cursor",
    description: "Generate .cursor/rules/*.mdc files",
  },
  {
    label: "Claude Code",
    value: "claude",
    description: "Generate CLAUDE.md and .claude/ config",
  },
  {
    label: "Qoder",
    value: "qoder",
    description: "Generate .qoder/ config files",
  },
];

export function ToolSelector({ selected, onSelect }: ToolSelectorProps): React.ReactElement {
  const handleSelect = (values: string[]): void => {
    onSelect(values);
  };

  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      flexDirection="column"
    >
      <Box marginBottom={1}>
        <Text bold color="cyan">🛠️  Select AI Tools</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">
          Use <Text color="yellow">Space</Text> to toggle, <Text color="green">Enter</Text> to confirm
        </Text>
      </Box>

      <SelectList
        options={TOOL_OPTIONS}
        selected={selected}
        onSelect={handleSelect}
        multiple={true}
      />
    </Box>
  );
}

export default ToolSelector;
