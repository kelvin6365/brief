/**
 * Spinner component
 * Displays a loading spinner with optional label
 */

import React from "react";
import { Text, Box } from "ink";
import InkSpinner from "ink-spinner";

export interface SpinnerProps {
  /** Label to display next to spinner */
  label?: string;
  /** Spinner type */
  type?: "dots" | "line" | "arc";
}

export function Spinner({ label, type = "dots" }: SpinnerProps): React.ReactElement {
  return (
    <Box>
      <Text color="cyan">
        <InkSpinner type={type} />
      </Text>
      {label && <Text> {label}</Text>}
    </Box>
  );
}

export default Spinner;
