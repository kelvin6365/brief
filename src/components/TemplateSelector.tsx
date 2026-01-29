/**
 * TemplateSelector component
 * Allows user to select which templates to include with grouped display
 */

import React, { useMemo, useState, useCallback } from "react";
import { Box, Text } from "ink";
import { GroupedSelectList } from "./GroupedSelectList.js";
import type { TemplateSelectorProps, SelectOption, SelectOptionGroup } from "./types.js";
import { getRecommendedTemplates } from "../templates/loader.js";
import type { TemplateDefinition } from "../templates/types.js";

/** Group templates by their category for display */
function groupTemplatesByCategory(
  templates: TemplateDefinition[],
  labelSuffix?: string
): Map<string, SelectOption<string>[]> {
  const groups = new Map<string, SelectOption<string>[]>();

  templates.forEach((t) => {
    const category = t.category || "other";
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push({
      label: labelSuffix ? `${t.name} ${labelSuffix}` : t.name,
      value: t.id,
      description: t.description,
    });
  });

  return groups;
}

/** Get display name for category */
function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    core: "Core (always included)",
    framework: "Detected",
    pattern: "Patterns",
    "project-type": "Project Types",
    other: "Other",
  };
  return names[category] || category;
}

export function TemplateSelector({
  detection,
  selected,
  onSelect,
}: TemplateSelectorProps): React.ReactElement {
  const [showAll, setShowAll] = useState(false);

  // Get recommended templates based on detection
  const { core, recommended, optional } = useMemo(
    () => getRecommendedTemplates(detection),
    [detection]
  );

  // Core template IDs (always selected)
  const coreIds = useMemo(() => core.map((t) => t.id), [core]);

  // Build grouped options
  const { visibleGroups, hiddenCount, allGroups } = useMemo(() => {
    const groups: SelectOptionGroup<string>[] = [];

    // Core templates (always included, disabled)
    if (core.length > 0) {
      groups.push({
        header: getCategoryDisplayName("core"),
        options: core.map((t) => ({
          label: t.name,
          value: t.id,
          description: t.description,
          disabled: true,
        })),
      });
    }

    // Recommended templates (detected frameworks/languages)
    const recommendedFiltered = recommended.filter(
      (t) => !core.find((c) => c.id === t.id)
    );
    if (recommendedFiltered.length > 0) {
      groups.push({
        header: "Detected (recommended)",
        options: recommendedFiltered.map((t) => ({
          label: t.name,
          value: t.id,
          description: t.description,
        })),
      });
    }

    // Common patterns (testing, security, api-design)
    const commonPatterns = optional.filter((t) =>
      ["testing", "api-design", "security"].includes(t.id)
    );
    if (commonPatterns.length > 0) {
      groups.push({
        header: "Patterns",
        options: commonPatterns.map((t) => ({
          label: t.name,
          value: t.id,
          description: t.description,
        })),
      });
    }

    // Calculate visible vs hidden
    const visibleTemplateIds = new Set([
      ...core.map((t) => t.id),
      ...recommendedFiltered.map((t) => t.id),
      ...commonPatterns.map((t) => t.id),
    ]);

    // Remaining optional templates
    const remainingOptional = optional.filter(
      (t) => !visibleTemplateIds.has(t.id)
    );

    // Build "all" groups including hidden ones (deep copy to avoid mutation)
    const allGroupsList = groups.map((g) => ({
      ...g,
      options: [...g.options],
    }));
    if (remainingOptional.length > 0) {
      // Group remaining by category
      const byCategory = groupTemplatesByCategory(remainingOptional);

      byCategory.forEach((options, category) => {
        const displayName = getCategoryDisplayName(category);
        // Check if we already have this group
        const existingGroup = allGroupsList.find((g) => g.header === displayName);
        if (existingGroup) {
          existingGroup.options.push(...options);
        } else {
          allGroupsList.push({
            header: displayName,
            options,
          });
        }
      });
    }

    return {
      visibleGroups: groups,
      hiddenCount: remainingOptional.length,
      allGroups: allGroupsList,
    };
  }, [core, recommended, optional]);

  // Ensure core templates are always in selection
  const effectiveSelected = useMemo(
    () => [...new Set([...coreIds, ...selected])],
    [coreIds, selected]
  );

  const handleSelect = useCallback(
    (values: string[]): void => {
      // Always keep core templates, pass non-core to parent
      const withCore = [...new Set([...coreIds, ...values])];
      onSelect(withCore.filter((id) => !coreIds.includes(id)));
    },
    [coreIds, onSelect]
  );

  const handleToggleShowMore = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  const displayGroups = showAll ? allGroups : visibleGroups;

  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      flexDirection="column"
    >
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Select Templates
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">
          <Text color="green">Core</Text> templates are always included
        </Text>
      </Box>

      <GroupedSelectList
        groups={displayGroups}
        selected={effectiveSelected}
        onSelect={handleSelect}
        hiddenCount={showAll ? 0 : hiddenCount}
        onToggleShowMore={handleToggleShowMore}
        showingAll={showAll}
      />
    </Box>
  );
}

export default TemplateSelector;
