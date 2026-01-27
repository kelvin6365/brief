/**
 * ProgressBar component
 * Displays a visual progress bar
 */

import React from "react";
import { Text, Box } from "ink";
import type { ProgressIndicatorProps } from "./types.js";

export interface ProgressBarProps extends ProgressIndicatorProps {
  /** Width of the progress bar */
  width?: number;
  /** Character for filled portion */
  filledChar?: string;
  /** Character for empty portion */
  emptyChar?: string;
}

export function ProgressBar({
  label,
  current,
  total,
  width = 30,
  filledChar = "█",
  emptyChar = "░",
}: ProgressBarProps): React.ReactElement {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;

  const filled = filledChar.repeat(filledWidth);
  const empty = emptyChar.repeat(emptyWidth);

  return (
    <Box flexDirection="column">
      <Text>{label}</Text>
      <Box>
        <Text color="green">{filled}</Text>
        <Text color="gray">{empty}</Text>
        <Text> {percentage}%</Text>
        <Text color="gray"> ({current}/{total})</Text>
      </Box>
    </Box>
  );
}

export default ProgressBar;
