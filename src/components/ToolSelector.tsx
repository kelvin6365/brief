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
    <Box flexDirection="column" marginY={1}>
      <Text bold color="cyan">Select AI Tools</Text>
      <Text color="gray" dimColor>Select one or more tools (Space to toggle, Enter to confirm)</Text>
      <Box marginTop={1}>
        <SelectList
          options={TOOL_OPTIONS}
          selected={selected}
          onSelect={handleSelect}
          multiple={true}
        />
      </Box>
    </Box>
  );
}

export default ToolSelector;
