/**
 * DiffViewer component
 * Displays a unified diff with color-coded lines
 */

import React from "react";
import { Text, Box } from "ink";
import type { DiffResult, DiffHunk, DiffLine } from "../utils/file-system.js";

export interface DiffViewerProps {
  /** The diff result to display */
  diff: DiffResult;
  /** Maximum number of lines to show (default: 50) */
  maxLines?: number;
  /** Whether to show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Context around hunks label */
  contextLabel?: string;
}

/**
 * Display a unified diff with color-coded lines
 */
export function DiffViewer({
  diff,
  maxLines = 50,
  showLineNumbers = true,
  contextLabel,
}: DiffViewerProps): React.ReactElement {
  const { hunks, similarityScore } = diff;

  // Calculate total lines to display
  const totalLines = hunks.reduce((sum, hunk) => sum + hunk.lines.length, 0);
  const truncated = totalLines > maxLines;

  // Collect lines to display
  let displayLines: Array<{ hunk: DiffHunk; line: DiffLine; hunkIndex: number }> = [];
  for (let hunkIndex = 0; hunkIndex < hunks.length; hunkIndex++) {
    const hunk = hunks[hunkIndex];
    if (hunk) {
      for (const line of hunk.lines) {
        displayLines.push({ hunk, line, hunkIndex });
      }
    }
  }

  // Truncate if needed
  if (truncated) {
    displayLines = displayLines.slice(0, maxLines);
  }

  // Calculate max line number width for padding
  const maxLineNum = Math.max(
    ...displayLines.map((d) => Math.max(d.line.originalLine || 0, d.line.modifiedLine || 0))
  );
  const lineNumWidth = String(maxLineNum).length;

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold>Changes</Text>
        {contextLabel && (
          <Text color="gray"> ({contextLabel})</Text>
        )}
        <Text color="gray"> - </Text>
        <SimilarityBadge score={similarityScore} />
      </Box>

      {/* Hunks */}
      {hunks.length === 0 ? (
        <Text color="gray">No changes detected</Text>
      ) : (
        <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
          {displayLines.map((item, index) => (
            <DiffLineComponent
              key={index}
              line={item.line}
              showLineNumbers={showLineNumbers}
              lineNumWidth={lineNumWidth}
            />
          ))}
          {truncated && (
            <Text color="gray" dimColor>
              ... {totalLines - maxLines} more lines
            </Text>
          )}
        </Box>
      )}

      {/* Summary */}
      <Box marginTop={1}>
        <DiffSummary hunks={hunks} />
      </Box>
    </Box>
  );
}

/**
 * Display a single diff line with appropriate coloring
 */
function DiffLineComponent({
  line,
  showLineNumbers,
  lineNumWidth,
}: {
  line: DiffLine;
  showLineNumbers: boolean;
  lineNumWidth: number;
}): React.ReactElement {
  const { type, content, originalLine, modifiedLine } = line;

  const colors = {
    unchanged: "gray",
    added: "green",
    removed: "red",
  } as const;

  const prefixes = {
    unchanged: " ",
    added: "+",
    removed: "-",
  } as const;

  const color = colors[type];
  const prefix = prefixes[type];

  // Format line numbers
  let lineNumStr = "";
  if (showLineNumbers) {
    const origStr = originalLine ? String(originalLine).padStart(lineNumWidth) : " ".repeat(lineNumWidth);
    const modStr = modifiedLine ? String(modifiedLine).padStart(lineNumWidth) : " ".repeat(lineNumWidth);
    lineNumStr = `${origStr} ${modStr} `;
  }

  return (
    <Box>
      {showLineNumbers && (
        <Text color="gray" dimColor>
          {lineNumStr}
        </Text>
      )}
      <Text color={color} bold={type !== "unchanged"}>
        {prefix}
      </Text>
      <Text color={type === "unchanged" ? undefined : color}>
        {content}
      </Text>
    </Box>
  );
}

/**
 * Display similarity score as a colored badge
 */
function SimilarityBadge({ score }: { score: number }): React.ReactElement {
  const percentage = Math.round(score * 100);

  let color: string;
  if (percentage >= 90) {
    color = "green";
  } else if (percentage >= 70) {
    color = "yellow";
  } else {
    color = "red";
  }

  return (
    <Text color={color}>
      {percentage}% similar
    </Text>
  );
}

/**
 * Display summary of changes
 */
function DiffSummary({ hunks }: { hunks: DiffHunk[] }): React.ReactElement {
  let added = 0;
  let removed = 0;

  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.type === "added") added++;
      else if (line.type === "removed") removed++;
    }
  }

  return (
    <Box>
      <Text color="green">+{added}</Text>
      <Text color="gray"> / </Text>
      <Text color="red">-{removed}</Text>
      <Text color="gray"> lines</Text>
    </Box>
  );
}

export default DiffViewer;
