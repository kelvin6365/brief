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
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      flexDirection="column"
    >
      <Box>
        <Text color="cyan">
          <InkSpinner type={type} />
        </Text>
        {label && <Text color="cyan"> {label}</Text>}
      </Box>
    </Box>
  );
}

export default Spinner;
