/**
 * ProjectInfo component
 * Displays detected project information
 */

import React from "react";
import { Text, Box } from "ink";
import type { ProjectInfoProps } from "./types.js";

export function ProjectInfo({ detection, projectPath }: ProjectInfoProps): React.ReactElement {
  const { language, packageManager, frameworks, testing, database, buildTools, styling } = detection;

  return (
    <Box
      borderStyle="round"
      borderColor="green"
      paddingX={2}
      paddingY={1}
      flexDirection="column"
    >
      <Box marginBottom={1}>
        <Text bold color="green">✓ Project Detected</Text>
      </Box>

      <Box flexDirection="column">
        <InfoRow label="📁 Path" value={projectPath} />
        <InfoRow label="💬 Language" value={language.primary} confidence={language.confidence} />
        <InfoRow label="📦 Package Manager" value={packageManager.name} />

        {frameworks.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="cyan">⚡ Frameworks:</Text>
            {frameworks.map((fw, i) => (
              <Box key={i} marginLeft={2}>
                <Text color="white">• {fw.name}</Text>
                {fw.version && <Text color="gray"> v{fw.version}</Text>}
                <ConfidenceBadge confidence={fw.confidence} />
              </Box>
            ))}
          </Box>
        )}

        {testing.length > 0 && (
          <InfoRow
            label="🧪 Testing"
            value={testing.map((t) => t.name).join(", ")}
          />
        )}

        {database.length > 0 && (
          <InfoRow
            label="🗄️  Database"
            value={database.map((d) => d.name).join(", ")}
          />
        )}

        {buildTools.length > 0 && (
          <InfoRow
            label="🔨 Build Tools"
            value={buildTools.map((b) => b.name).join(", ")}
          />
        )}

        {styling.length > 0 && (
          <InfoRow
            label="🎨 Styling"
            value={styling.map((s) => s.name).join(", ")}
          />
        )}
      </Box>
    </Box>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  confidence?: number;
}

function InfoRow({ label, value, confidence }: InfoRowProps): React.ReactElement {
  return (
    <Box>
      <Text color="gray">{label}: </Text>
      <Text>{value}</Text>
      {confidence !== undefined && <ConfidenceBadge confidence={confidence} />}
    </Box>
  );
}

interface ConfidenceBadgeProps {
  confidence: number;
}

function ConfidenceBadge({ confidence }: ConfidenceBadgeProps): React.ReactElement {
  // Confidence is already 0-100, not 0-1
  const percentage = Math.round(confidence);
  const color = confidence >= 80 ? "green" : confidence >= 50 ? "yellow" : "red";

  return (
    <Text color={color} dimColor> ({percentage}%)</Text>
  );
}

export default ProjectInfo;
