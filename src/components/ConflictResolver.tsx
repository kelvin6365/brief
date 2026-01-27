/**
 * ConflictResolver component
 * Interactive UI for resolving merge conflicts
 */

import React, { useState, useCallback } from "react";
import { Text, Box, useInput } from "ink";
import type { ConflictInfo, ConflictResolution } from "../generators/types.js";
import { DiffViewer } from "./DiffViewer.js";

export interface ConflictResolverProps {
  /** Information about the conflict */
  conflict: ConflictInfo;
  /** Callback when user resolves the conflict */
  onResolve: (resolution: ConflictResolution) => void;
  /** Callback when user wants to skip this file */
  onSkip?: () => void;
}

type ResolutionOption = "accept-incoming" | "keep-original" | "skip";

interface Option {
  key: string;
  label: string;
  description: string;
  value: ResolutionOption;
}

const OPTIONS: Option[] = [
  {
    key: "a",
    label: "Accept incoming",
    description: "Replace existing file with new version",
    value: "accept-incoming",
  },
  {
    key: "k",
    label: "Keep original",
    description: "Keep existing file unchanged",
    value: "keep-original",
  },
  {
    key: "s",
    label: "Skip",
    description: "Skip this file for now",
    value: "skip",
  },
];

/**
 * Interactive conflict resolution UI
 */
export function ConflictResolver({
  conflict,
  onResolve,
  onSkip,
}: ConflictResolverProps): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFullDiff, setShowFullDiff] = useState(false);

  const handleSelect = useCallback((option: Option) => {
    if (option.value === "skip") {
      onSkip?.();
      // Also treat skip as keep-original
      onResolve({ action: "keep-original" });
    } else if (option.value === "accept-incoming") {
      onResolve({ action: "accept-incoming" });
    } else {
      onResolve({ action: "keep-original" });
    }
  }, [onResolve, onSkip]);

  useInput((input, key) => {
    // Navigation
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : OPTIONS.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < OPTIONS.length - 1 ? prev + 1 : 0));
    }
    // Select
    else if (key.return) {
      const option = OPTIONS[selectedIndex];
      if (option) handleSelect(option);
    }
    // Quick keys
    else if (input === "a" || input === "A") {
      const option = OPTIONS[0];
      if (option) handleSelect(option); // Accept incoming
    } else if (input === "k" || input === "K") {
      const option = OPTIONS[1];
      if (option) handleSelect(option); // Keep original
    } else if (input === "s" || input === "S") {
      const option = OPTIONS[2];
      if (option) handleSelect(option); // Skip
    }
    // Toggle full diff
    else if (input === "d" || input === "D") {
      setShowFullDiff((prev) => !prev);
    }
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="yellow">Conflict: </Text>
        <Text>{conflict.relativePath}</Text>
      </Box>

      {/* Similarity info */}
      <Box marginBottom={1}>
        <Text color="gray">Similarity: </Text>
        <SimilarityIndicator score={conflict.diff.similarityScore} />
      </Box>

      {/* Diff view */}
      <Box marginBottom={1}>
        <DiffViewer
          diff={conflict.diff}
          maxLines={showFullDiff ? 200 : 20}
          contextLabel={conflict.relativePath}
        />
      </Box>

      {/* Toggle hint */}
      <Box marginBottom={1}>
        <Text color="gray">
          Press <Text color="cyan">d</Text> to {showFullDiff ? "collapse" : "expand"} diff
        </Text>
      </Box>

      {/* Options */}
      <Box flexDirection="column" marginTop={1}>
        <Box marginBottom={1}>
          <Text bold>How do you want to resolve this?</Text>
        </Box>
        {OPTIONS.map((option, index) => (
          <OptionRow
            key={option.key}
            option={option}
            isSelected={index === selectedIndex}
          />
        ))}
      </Box>

      {/* Help */}
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Use <Text color="cyan">arrow keys</Text> to navigate, <Text color="cyan">Enter</Text> to select,
          or press <Text color="cyan">{OPTIONS.map(o => o.key).join("/")}</Text> for quick select
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Single option row
 */
function OptionRow({
  option,
  isSelected,
}: {
  option: Option;
  isSelected: boolean;
}): React.ReactElement {
  return (
    <Box>
      <Text color={isSelected ? "cyan" : "gray"}>
        {isSelected ? ">" : " "} [{option.key}] {option.label}
      </Text>
      <Text color="gray" dimColor>
        {" - "}{option.description}
      </Text>
    </Box>
  );
}

/**
 * Display similarity with color indicator
 */
function SimilarityIndicator({ score }: { score: number }): React.ReactElement {
  const percentage = Math.round(score * 100);

  let color: string;
  let label: string;

  if (percentage >= 90) {
    color = "green";
    label = "high";
  } else if (percentage >= 70) {
    color = "yellow";
    label = "moderate";
  } else {
    color = "red";
    label = "low";
  }

  return (
    <Text>
      <Text color={color}>{percentage}%</Text>
      <Text color="gray"> ({label})</Text>
    </Text>
  );
}

export default ConflictResolver;
