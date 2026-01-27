/**
 * TemplateSelector component
 * Allows user to select which templates to include
 */

import React, { useMemo } from "react";
import { Box, Text } from "ink";
import { SelectList } from "./SelectList.js";
import type { TemplateSelectorProps, SelectOption } from "./types.js";
import { getRecommendedTemplates } from "../templates/loader.js";

export function TemplateSelector({
  detection,
  selected,
  onSelect,
}: TemplateSelectorProps): React.ReactElement {
  // Get recommended templates based on detection
  const { core, recommended, optional } = useMemo(
    () => getRecommendedTemplates(detection),
    [detection]
  );

  // Build options list
  const options: SelectOption[] = useMemo(() => {
    const result: SelectOption[] = [];

    // Core templates (always included, shown but disabled)
    core.forEach((t) => {
      result.push({
        label: `${t.name} (core)`,
        value: t.id,
        description: t.description,
        disabled: true,
      });
    });

    // Recommended templates
    recommended.forEach((t) => {
      if (!core.find((c) => c.id === t.id)) {
        result.push({
          label: `${t.name} (recommended)`,
          value: t.id,
          description: t.description,
        });
      }
    });

    // Optional templates
    optional.forEach((t) => {
      result.push({
        label: t.name,
        value: t.id,
        description: t.description,
      });
    });

    return result;
  }, [core, recommended, optional]);

  // Ensure core templates are always selected
  const coreIds = core.map((t) => t.id);
  const effectiveSelected = [...new Set([...coreIds, ...selected])];

  const handleSelect = (values: string[]): void => {
    // Always keep core templates selected
    const withCore = [...new Set([...coreIds, ...values])];
    onSelect(withCore.filter((id) => !coreIds.includes(id))); // Only pass non-core to parent
  };

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="cyan">Select Templates</Text>
      <Text color="gray" dimColor>Choose which rule templates to generate</Text>
      <Box marginTop={1}>
        <SelectList
          options={options}
          selected={effectiveSelected}
          onSelect={handleSelect}
          multiple={true}
        />
      </Box>
    </Box>
  );
}

export default TemplateSelector;
