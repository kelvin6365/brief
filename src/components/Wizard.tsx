/**
 * Wizard component
 * Main interactive wizard for Brief CLI
 */

import React, { useReducer, useEffect, useCallback, type Reducer } from "react";
import { Text, Box, useApp } from "ink";
import type { WizardState, WizardAction, WizardStep, WizardConfig } from "./types.js";
import type { AiInitConfig, AiTool } from "../types/index.js";
import { Spinner } from "./Spinner.js";
import { StatusMessage } from "./StatusMessage.js";
import { ProjectInfo } from "./ProjectInfo.js";
import { ToolSelector } from "./ToolSelector.js";
import { TemplateSelector } from "./TemplateSelector.js";
import { ConfirmStep } from "./ConfirmStep.js";
import { Results } from "./Results.js";
import { detectProject } from "../detectors/index.js";
import { runGenerators } from "../generators/index.js";
import { getTerminalChars } from "../utils/terminal.js";

export interface WizardProps {
  /** Project path to configure */
  projectPath: string;
  /** Skip interactive prompts */
  skipPrompts?: boolean;
  /** Pre-selected tools */
  tools?: string[];
  /** Pre-selected templates */
  templates?: string[];
  /** Dry run mode */
  dryRun?: boolean;
  /** Enable smart merge mode for existing files */
  mergeMode?: boolean;
  /** Similarity threshold for auto-merge (0-1) */
  autoMergeThreshold?: number;
  /** Callback when wizard completes */
  onComplete?: (success: boolean) => void;
}

const initialConfig: WizardConfig = {
  version: "1.0.0",
  projectType: "app",
  language: "typescript",
  tools: [],
  templates: [],
};

const initialState: WizardState = {
  step: "detecting",
  projectPath: "",
  detection: null,
  config: initialConfig,
  results: null,
  error: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_DETECTION":
      return {
        ...state,
        detection: action.detection,
        config: {
          ...state.config,
          language: action.detection.language.primary,
        },
      };
    case "SET_TOOLS":
      return {
        ...state,
        config: { ...state.config, tools: action.tools },
      };
    case "SET_TEMPLATES":
      return {
        ...state,
        config: { ...state.config, templates: action.templates },
      };
    case "SET_PROJECT_TYPE":
      return {
        ...state,
        config: { ...state.config, projectType: action.projectType },
      };
    case "SET_RESULTS":
      return { ...state, results: action.results };
    case "SET_ERROR":
      return { ...state, error: action.error, step: "error" };
    case "RESET":
      return { ...initialState, projectPath: state.projectPath };
    default:
      return state;
  }
}

export function Wizard({
  projectPath,
  skipPrompts = false,
  tools: preselectedTools,
  templates: preselectedTemplates,
  dryRun = false,
  mergeMode = false,
  autoMergeThreshold,
  onComplete,
}: WizardProps): React.ReactElement {
  const { exit } = useApp();
  const [state, dispatch] = useReducer<Reducer<WizardState, WizardAction>>(wizardReducer, {
    ...initialState,
    projectPath,
    config: {
      ...initialConfig,
      tools: preselectedTools || [],
      templates: preselectedTemplates || [],
    },
  });

  // Run detection on mount
  useEffect(() => {
    async function runDetection(): Promise<void> {
      try {
        const detection = await detectProject(projectPath);
        dispatch({ type: "SET_DETECTION", detection });

        if (skipPrompts) {
          // Skip to generation if prompts are disabled
          dispatch({ type: "SET_STEP", step: "generating" });
        } else {
          dispatch({ type: "SET_STEP", step: "project-info" });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        dispatch({ type: "SET_ERROR", error: message });
      }
    }

    if (state.step === "detecting") {
      runDetection();
    }
  }, [projectPath, skipPrompts, state.step]);

  // Run generation when step is "generating"
  useEffect(() => {
    async function runGeneration(): Promise<void> {
      if (!state.detection) {
        dispatch({ type: "SET_ERROR", error: "No detection results" });
        return;
      }

      try {
        const tools = state.config.tools.length > 0 ? state.config.tools : ["hybrid"];
        const config: AiInitConfig = {
          version: state.config.version || "1.0.0",
          projectType: state.config.projectType || "app",
          language: state.detection.language.primary,
          tools: tools as AiTool[],
          templates: state.config.templates || [],
        };

        const results = await runGenerators({
          projectPath,
          detection: state.detection,
          config,
          dryRun,
          mergeMode,
          autoMergeThreshold,
          backup: mergeMode, // Always backup in merge mode
        });

        dispatch({ type: "SET_RESULTS", results });
        dispatch({ type: "SET_STEP", step: "complete" });
        onComplete?.(results.success);
        // Exit the Ink app after a short delay to show results
        setTimeout(() => exit(), 100);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        dispatch({ type: "SET_ERROR", error: message });
        onComplete?.(false);
        // Exit the Ink app after a short delay to show error
        setTimeout(() => exit(), 100);
      }
    }

    if (state.step === "generating") {
      runGeneration();
    }
  }, [state.step, state.detection, state.config, projectPath, dryRun, mergeMode, autoMergeThreshold, onComplete, exit]);

  // Navigation handlers
  const goToStep = useCallback((step: WizardStep) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  const handleToolSelect = useCallback((tools: string[]) => {
    dispatch({ type: "SET_TOOLS", tools });
  }, []);

  const handleTemplateSelect = useCallback((templates: string[]) => {
    dispatch({ type: "SET_TEMPLATES", templates });
  }, []);

  // Render current step
  const renderStep = (): React.ReactElement => {
    switch (state.step) {
      case "detecting":
        return <Spinner label="Detecting project configuration..." />;

      case "project-info":
        return (
          <Box flexDirection="column">
            {state.detection && (
              <ProjectInfo
                detection={state.detection}
                projectPath={projectPath}
              />
            )}
            <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
              <Text color="gray">Press </Text>
              <Text color="green" bold>Enter</Text>
              <Text color="gray"> to continue</Text>
            </Box>
            <ContinueHandler onContinue={() => goToStep("tool-select")} />
          </Box>
        );

      case "tool-select":
        return (
          <Box flexDirection="column">
            <ToolSelector
              selected={state.config.tools || []}
              onSelect={handleToolSelect}
            />
            <ContinueHandler
              onContinue={() => goToStep("template-select")}
              requireSelection={state.config.tools?.length === 0}
            />
          </Box>
        );

      case "template-select":
        return (
          <Box flexDirection="column">
            {state.detection && (
              <TemplateSelector
                detection={state.detection}
                selected={state.config.templates || []}
                onSelect={handleTemplateSelect}
              />
            )}
            <ContinueHandler onContinue={() => goToStep("confirm")} />
          </Box>
        );

      case "confirm":
        return (
          <ConfirmStep
            state={state}
            onConfirm={() => goToStep("generating")}
            onBack={() => goToStep("template-select")}
          />
        );

      case "generating":
        return <Spinner label="Generating configuration files..." />;

      case "complete":
        return (
          <Box flexDirection="column">
            {state.results && <Results results={state.results} />}
          </Box>
        );

      case "error":
        return (
          <Box flexDirection="column">
            <StatusMessage type="error">
              {state.error || "An unknown error occurred"}
            </StatusMessage>
            <Box marginTop={1}>
              <Text color="gray">Press </Text>
              <Text color="cyan">Ctrl+C</Text>
              <Text color="gray"> to exit</Text>
            </Box>
          </Box>
        );

      default:
        return <Text>Unknown step</Text>;
    }
  };

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {/* Header with border */}
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={0}
        marginBottom={1}
      >
        <Text bold color="cyan">✨ Brief</Text>
        <Text color="gray"> · AI Configuration Generator</Text>
      </Box>

      {/* Step indicator */}
      <StepIndicator currentStep={state.step} />

      {/* Content */}
      <Box marginTop={1}>
        {renderStep()}
      </Box>
    </Box>
  );
}

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: WizardStep }): React.ReactElement {
  const stepConfig: Array<{ step: WizardStep; label: string; icon: string }> = [
    { step: "detecting", label: "Detect", icon: "🔍" },
    { step: "project-info", label: "Review", icon: "📋" },
    { step: "tool-select", label: "Tools", icon: "🛠️" },
    { step: "template-select", label: "Templates", icon: "📄" },
    { step: "confirm", label: "Confirm", icon: "✓" },
    { step: "generating", label: "Generate", icon: "⚙️" },
  ];

  const currentIndex = stepConfig.findIndex((s) => s.step === currentStep);
  const chars = getTerminalChars();

  // Don't show step indicator on complete or error
  if (currentStep === "complete" || currentStep === "error") {
    return <Box />;
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        {stepConfig.map((stepItem, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isPending = i > currentIndex;

          return (
            <React.Fragment key={stepItem.step}>
              <Box>
                <Text
                  bold={isCurrent}
                  color={isCompleted ? "green" : isCurrent ? "cyan" : "gray"}
                  dimColor={isPending}
                >
                  {isCompleted ? chars.check : isCurrent ? chars.cursor : chars.bullet}
                </Text>
                <Text> </Text>
                <Text
                  color={isCompleted ? "green" : isCurrent ? "cyan" : "gray"}
                  dimColor={isPending}
                >
                  {stepItem.label}
                </Text>
              </Box>
              {i < stepConfig.length - 1 && (
                <Text color="gray" dimColor>
                  {" "}→{" "}
                </Text>
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}

// Helper component to handle continue action
function ContinueHandler({
  onContinue,
  requireSelection = false,
}: {
  onContinue: () => void;
  requireSelection?: boolean;
}): React.ReactElement | null {
  const { useInput } = require("ink");

  useInput((_input: string, key: { return?: boolean }) => {
    if (key.return && !requireSelection) {
      onContinue();
    }
  });

  return null;
}

export default Wizard;
