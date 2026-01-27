/**
 * SelectList component
 * A navigable list for single or multi-selection
 */

import React, { useState } from "react";
import { Text, Box, useInput } from "ink";
import type { SelectOption } from "./types.js";

export interface SelectListProps<T = string> {
  /** Options to display */
  options: SelectOption<T>[];
  /** Currently selected values */
  selected: T[];
  /** Callback when selection changes */
  onSelect: (selected: T[]) => void;
  /** Callback when user confirms selection */
  onConfirm?: () => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Label for the list */
  label?: string;
}

export function SelectList<T = string>({
  options,
  selected,
  onSelect,
  onConfirm,
  multiple = false,
  label,
}: SelectListProps<T>): React.ReactElement {
  const [cursor, setCursor] = useState(0);

  // Handle keyboard input
  useInput((input, key) => {
    // Navigate up
    if (key.upArrow) {
      setCursor((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    }

    // Navigate down
    if (key.downArrow) {
      setCursor((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    }

    // Toggle selection (space) or select single (enter)
    if (input === " " || key.return) {
      const option = options[cursor];
      if (option && !option.disabled) {
        if (multiple && input === " ") {
          // Toggle in multi-select mode
          const isSelected = selected.includes(option.value);
          if (isSelected) {
            onSelect(selected.filter((v) => v !== option.value));
          } else {
            onSelect([...selected, option.value]);
          }
        } else if (key.return) {
          if (multiple) {
            // Confirm multi-selection
            onConfirm?.();
          } else {
            // Single select
            onSelect([option.value]);
            onConfirm?.();
          }
        }
      }
    }

    // Select all (a) in multi-select mode
    if (multiple && input === "a") {
      const allEnabled = options.filter((o) => !o.disabled).map((o) => o.value);
      const allSelected = allEnabled.every((v) => selected.includes(v));
      if (allSelected) {
        onSelect([]);
      } else {
        onSelect(allEnabled);
      }
    }
  });

  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Text bold color="cyan">{label}</Text>
        </Box>
      )}

      {options.map((option, index) => {
        const isSelected = selected.includes(option.value);
        const isCursor = index === cursor;

        return (
          <Box key={index}>
            {/* Cursor indicator */}
            <Text color="cyan">{isCursor ? "❯ " : "  "}</Text>

            {/* Checkbox for multi-select */}
            {multiple && (
              <Text color={isSelected ? "green" : "gray"}>
                {isSelected ? "[✓] " : "[ ] "}
              </Text>
            )}

            {/* Radio for single-select */}
            {!multiple && (
              <Text color={isSelected ? "green" : "gray"}>
                {isSelected ? "(●) " : "( ) "}
              </Text>
            )}

            {/* Option label */}
            <Text
              color={option.disabled ? "gray" : undefined}
              dimColor={option.disabled}
            >
              {option.label}
            </Text>

            {/* Description */}
            {option.description && (
              <Text color="gray" dimColor> - {option.description}</Text>
            )}
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          {multiple
            ? "↑↓ navigate • space toggle • a select all • enter confirm"
            : "↑↓ navigate • enter select"}
        </Text>
      </Box>
    </Box>
  );
}

export default SelectList;
