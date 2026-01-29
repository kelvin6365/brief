/**
 * GroupedSelectList component
 * A navigable list with section headers for grouped multi-selection
 */

import React, { useState, useMemo } from "react";
import { Text, Box, useInput } from "ink";
import type { SelectOption, SelectOptionGroup } from "./types.js";
import { getTerminalChars, formatInstructions } from "../utils/terminal.js";

export interface GroupedSelectListProps<T = string> {
  /** Grouped options to display */
  groups: SelectOptionGroup<T>[];
  /** Currently selected values */
  selected: T[];
  /** Callback when selection changes */
  onSelect: (selected: T[]) => void;
  /** Callback when user confirms selection */
  onConfirm?: () => void;
  /** Label for the list */
  label?: string;
  /** Show "Show more" toggle for hidden items */
  hiddenCount?: number;
  /** Callback when "Show more" is toggled */
  onToggleShowMore?: () => void;
  /** Whether showing all items */
  showingAll?: boolean;
}

interface FlatItem<T> {
  type: "header" | "option" | "showMore";
  header?: string;
  option?: SelectOption<T>;
  groupIndex?: number;
}

export function GroupedSelectList<T = string>({
  groups,
  selected,
  onSelect,
  onConfirm,
  label,
  hiddenCount = 0,
  onToggleShowMore,
  showingAll = false,
}: GroupedSelectListProps<T>): React.ReactElement {
  const chars = getTerminalChars();

  // Flatten groups into navigable items (skip headers for navigation)
  const { flatItems, selectableIndices } = useMemo(() => {
    const items: FlatItem<T>[] = [];
    const selectable: number[] = [];

    groups.forEach((group, groupIndex) => {
      // Add header
      items.push({ type: "header", header: group.header, groupIndex });

      // Add options
      group.options.forEach((option) => {
        if (!option.disabled) {
          selectable.push(items.length);
        }
        items.push({ type: "option", option, groupIndex });
      });
    });

    // Add "Show more" toggle if there are hidden items
    if (hiddenCount > 0 || showingAll) {
      selectable.push(items.length);
      items.push({ type: "showMore" });
    }

    return { flatItems: items, selectableIndices: selectable };
  }, [groups, hiddenCount, showingAll]);

  const [cursorIndex, setCursorIndex] = useState(0);

  // Handle keyboard input
  useInput((input, key) => {
    // Navigate up
    if (key.upArrow) {
      setCursorIndex((prev) =>
        prev > 0 ? prev - 1 : selectableIndices.length - 1
      );
    }

    // Navigate down
    if (key.downArrow) {
      setCursorIndex((prev) =>
        prev < selectableIndices.length - 1 ? prev + 1 : 0
      );
    }

    // Toggle selection (space) or confirm (enter)
    if (input === " " || key.return) {
      const flatIndex = selectableIndices[cursorIndex];
      if (flatIndex === undefined) return;
      const item = flatItems[flatIndex];

      if (item?.type === "showMore") {
        onToggleShowMore?.();
      } else if (item?.type === "option" && item.option && !item.option.disabled) {
        if (input === " ") {
          // Toggle selection
          const isSelected = selected.includes(item.option.value);
          if (isSelected) {
            onSelect(selected.filter((v) => v !== item.option!.value));
          } else {
            onSelect([...selected, item.option.value]);
          }
        } else if (key.return) {
          // Confirm selection
          onConfirm?.();
        }
      }
    }

    // Select all (a)
    if (input === "a") {
      const allEnabled = flatItems
        .filter((item): item is FlatItem<T> & { option: SelectOption<T> } =>
          item.type === "option" && !!item.option && !item.option.disabled
        )
        .map((item) => item.option.value);

      const allSelected = allEnabled.every((v) => selected.includes(v));
      if (allSelected) {
        // Keep only core (disabled) items
        const coreItems = flatItems
          .filter((item): item is FlatItem<T> & { option: SelectOption<T> } =>
            item.type === "option" && !!item.option && item.option.disabled === true
          )
          .map((item) => item.option.value);
        onSelect(coreItems);
      } else {
        onSelect([...new Set([...selected, ...allEnabled])]);
      }
    }
  });

  let selectableCounter = 0;

  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Text bold color="cyan">
            {label}
          </Text>
        </Box>
      )}

      {flatItems.map((item, index) => {
        if (item.type === "header") {
          return (
            <Box key={`header-${index}`} marginTop={index > 0 ? 1 : 0}>
              <Text color="gray" dimColor>
                {chars.boxHorizontal}{chars.boxHorizontal} {item.header} {chars.boxHorizontal.repeat(Math.max(0, 36 - (item.header?.length ?? 0)))}
              </Text>
            </Box>
          );
        }

        if (item.type === "showMore") {
          const isCursor = selectableIndices[cursorIndex] === index;
          selectableCounter++;
          return (
            <Box key="showMore" marginTop={1}>
              <Text color="cyan">{isCursor ? `${chars.cursor} ` : "  "}</Text>
              <Text color="yellow">
                {showingAll
                  ? `${chars.arrowUp} Show less`
                  : `${chars.arrowDown} Show ${hiddenCount} more templates...`}
              </Text>
            </Box>
          );
        }

        if (item.type === "option" && item.option) {
          const option = item.option;
          const isSelected = selected.includes(option.value);
          const isCursor = selectableIndices[cursorIndex] === index;
          selectableCounter++;

          return (
            <Box key={`option-${index}`}>
              {/* Cursor indicator */}
              <Text color="cyan">{isCursor ? `${chars.cursor} ` : "  "}</Text>

              {/* Checkbox */}
              <Text color={option.disabled ? "gray" : isSelected ? "green" : "gray"}>
                [{isSelected ? chars.checkboxChecked : chars.checkboxUnchecked}]{" "}
              </Text>

              {/* Option label */}
              <Text
                color={option.disabled ? "gray" : undefined}
                dimColor={option.disabled}
              >
                {option.label}
              </Text>

              {/* Description - truncated */}
              {option.description && (
                <Text color="gray" dimColor>
                  {" "}- {option.description.length > 40
                    ? option.description.slice(0, 37) + "..."
                    : option.description}
                </Text>
              )}
            </Box>
          );
        }

        return null;
      })}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          {formatInstructions([
            `${chars.arrowUp}${chars.arrowDown} navigate`,
            "space toggle",
            "a all",
            "enter confirm",
          ])}
        </Text>
      </Box>
    </Box>
  );
}

export default GroupedSelectList;
