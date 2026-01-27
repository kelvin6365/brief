/**
 * StatusMessage component
 * Displays styled status messages with icons
 */

import React from "react";
import { Text, Box } from "ink";
import type { StatusMessageProps } from "./types.js";

const STATUS_CONFIG = {
  info: { icon: "ℹ", color: "blue" },
  success: { icon: "✓", color: "green" },
  warning: { icon: "⚠", color: "yellow" },
  error: { icon: "✗", color: "red" },
} as const;

export function StatusMessage({ type, children }: StatusMessageProps): React.ReactElement {
  const config = STATUS_CONFIG[type];

  return (
    <Box>
      <Text color={config.color}>{config.icon} </Text>
      <Text>{children}</Text>
    </Box>
  );
}

export default StatusMessage;
