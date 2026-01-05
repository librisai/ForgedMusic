import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { STEP_IDS, STEPS } from "./steps";

const ProjectContext = createContext(null);

const initialCompleted = STEP_IDS.reduce((accumulator, stepId) => {
  accumulator[stepId] = false;
  return accumulator;
}, {});

const initialProject = {
  audioFile: null,
  title: "",
  artist: "",
  lyrics: "",
  durationMode: "full",
  clipLength: 30,
  visualMode: "visualizer",
  performanceMode: "auto",
  performanceImageFile: null,
};

export function ProjectProvider({ children }) {
  const [currentStep, setCurrentStep] = useState("create");
  const [completedSteps, setCompletedSteps] = useState(initialCompleted);
  const [audioMetadata, setAudioMetadata] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [project, setProject] = useState(initialProject);

  const markStepComplete = useCallback((stepId, isComplete = true) => {
    setCompletedSteps(previous => {
      if (previous[stepId] === isComplete) {
        return previous;
      }
      return { ...previous, [stepId]: isComplete };
    });
  }, []);

  const setStepCompletion = useCallback((stepId, isComplete) => {
    setCompletedSteps(previous => {
      if (previous[stepId] === isComplete) {
        return previous;
      }
      return { ...previous, [stepId]: isComplete };
    });
  }, []);

  const setProjectField = useCallback((field, value) => {
    setProject(previous => {
      if (previous[field] === value) {
        return previous;
      }
      return { ...previous, [field]: value };
    });
  }, []);

  const canAccessStep = useCallback(
    stepId => {
      const stepIndex = STEP_IDS.indexOf(stepId);
      if (stepIndex <= 0) {
        return true;
      }
      return STEP_IDS.slice(0, stepIndex).every(id => completedSteps[id]);
    },
    [completedSteps]
  );

  const lastAccessibleStep = useMemo(() => {
    let lastStepId = STEP_IDS[0];
    for (const stepId of STEP_IDS) {
      if (canAccessStep(stepId)) {
        lastStepId = stepId;
      } else {
        break;
      }
    }
    return STEPS.find(step => step.id === lastStepId);
  }, [canAccessStep]);

  const value = useMemo(
    () => ({
      steps: STEPS,
      currentStep,
      setCurrentStep,
      completedSteps,
      markStepComplete,
      setStepCompletion,
      canAccessStep,
      lastAccessibleStep,
      audioMetadata,
      setAudioMetadata,
      selectedStyle,
      setSelectedStyle,
      project,
      setProjectField,
    }),
    [
      currentStep,
      completedSteps,
      markStepComplete,
      setStepCompletion,
      canAccessStep,
      lastAccessibleStep,
      audioMetadata,
      selectedStyle,
      project,
      setProjectField,
    ]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectState() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectState must be used within ProjectProvider");
  }
  return context;
}
