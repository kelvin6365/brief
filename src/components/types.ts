/**
 * Component type definitions
 */

import type { FullProjectDetection } from "../detectors/types.js";
import type { FullGeneratorResult, ConflictInfo, ConflictResolution } from "../generators/types.js";
import type { DiffResult } from "../utils/file-system.js";

/** Wizard step */
export type WizardStep =
  | "detecting"
  | "project-info"
  | "tool-select"
  | "template-select"
  | "confirm"
  | "generating"
  | "complete"
  | "error";

/** Wizard configuration state */
export interface WizardConfig {
  version: string;
  projectType: string;
  language: string;
  tools: string[];
  templates: string[];
}

/** Wizard state */
export interface WizardState {
  /** Current step */
  step: WizardStep;
  /** Project path */
  projectPath: string;
  /** Detection results */
  detection: FullProjectDetection | null;
  /** User configuration */
  config: WizardConfig;
  /** Generation results */
  results: FullGeneratorResult | null;
  /** Error message if any */
  error: string | null;
}

/** Wizard action */
export type WizardAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_DETECTION"; detection: FullProjectDetection }
  | { type: "SET_TOOLS"; tools: string[] }
  | { type: "SET_TEMPLATES"; templates: string[] }
  | { type: "SET_PROJECT_TYPE"; projectType: string }
  | { type: "SET_RESULTS"; results: FullGeneratorResult }
  | { type: "SET_ERROR"; error: string }
  | { type: "RESET" };

/** SelectOption for selection components */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  description?: string;
  disabled?: boolean;
}

/** Grouped select option with section header */
export interface SelectOptionGroup<T = string> {
  /** Group header label */
  header: string;
  /** Options in this group */
  options: SelectOption<T>[];
  /** Whether this group is collapsed */
  collapsed?: boolean;
}

/** Props for ProjectInfo component */
export interface ProjectInfoProps {
  detection: FullProjectDetection;
  projectPath: string;
}

/** Props for ToolSelector component */
export interface ToolSelectorProps {
  selected: string[];
  onSelect: (tools: string[]) => void;
}

/** Props for TemplateSelector component */
export interface TemplateSelectorProps {
  detection: FullProjectDetection;
  selected: string[];
  onSelect: (templates: string[]) => void;
}

/** Props for ProgressIndicator component */
export interface ProgressIndicatorProps {
  label: string;
  current: number;
  total: number;
}

/** Props for Results component */
export interface ResultsProps {
  results: FullGeneratorResult;
}

/** Props for StatusMessage component */
export interface StatusMessageProps {
  type: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
}

/** Props for DiffViewer component */
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

/** Props for ConflictResolver component */
export interface ConflictResolverProps {
  /** Information about the conflict */
  conflict: ConflictInfo;
  /** Callback when user resolves the conflict */
  onResolve: (resolution: ConflictResolution) => void;
  /** Callback when user wants to skip this file */
  onSkip?: () => void;
}
