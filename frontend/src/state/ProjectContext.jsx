import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getBillingStatus } from "../api/billingApi";
import { CONTROL_PROFILES } from "../ui/controlProfiles";
import { ROOMS } from "./projectState";

const ProjectContext = createContext(null);

const DEFAULT_PROFILE = "cinematic";
const DEFAULT_PROFILE_CONFIG = CONTROL_PROFILES[DEFAULT_PROFILE] || { addOns: {}, renderParams: {} };

const initialProject = {
  projectId: "",
  audioFile: null,
  audioUploaded: false,
  title: "",
  artist: "",
  lyrics: "",
  durationMode: "full",
  clipLength: 30,
  mode: "",
  visualMode: "",
  performanceMode: "auto",
  performanceImageFile: null,
  avatarFiles: [],
  avatarPreviews: [],
  primaryAvatarIndex: 0,
  avatarId: null,
  avatarName: "",
  avatarSelected: false,
  lockManualPerformanceImage: false,
  aspectRatio: "16:9",
  lighting: "Neon rim",
  camera: "Locked off",
  texture: "Clean digital",
  styleAdvanced: { motion: true, grain: false, cuts: false },
  styleComplete: false,
  screeningComplete: false,
  controlProfile: DEFAULT_PROFILE,
  addOns: { ...(DEFAULT_PROFILE_CONFIG.addOns || {}) },
  renderParams: { ...(DEFAULT_PROFILE_CONFIG.renderParams || {}) },
  renderVersions: [],
  exportVersions: [],
  notes: "",
  quickForgePrompt: "",
  quickForgeSeeded: false,
};

export function ProjectProvider({ children, projectId }) {
  const [audioMetadata, setAudioMetadata] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [project, setProject] = useState(() => ({ ...initialProject, projectId: projectId || "" }));
  const [billingStatus, setBillingStatus] = useState(null);
  const [billingError, setBillingError] = useState("");

  const setProjectField = useCallback((field, value) => {
    setProject(previous => {
      const nextValue = typeof value === "function" ? value(previous[field], previous) : value;
      if (previous[field] === nextValue) {
        return previous;
      }
      return { ...previous, [field]: nextValue };
    });
  }, []);

  const setProjectFields = useCallback(updates => {
    if (!updates || typeof updates !== "object") return;
    setProject(previous => ({ ...previous, ...updates }));
  }, []);

  const applyControlProfile = useCallback(profileId => {
    const preset = CONTROL_PROFILES[profileId];
    if (!preset) return;
    setProject(previous => {
      const next = { ...(previous || {}) };
      next.controlProfile = profileId;
      next.addOns = { ...(next.addOns || {}), ...(preset.addOns || {}) };
      next.renderParams = { ...(next.renderParams || {}), ...(preset.renderParams || {}) };
      return next;
    });
  }, []);

  const refreshBillingStatus = useCallback(async () => {
    try {
      setBillingError("");
      const status = await getBillingStatus();
      setBillingStatus(status);
      return status;
    } catch (err) {
      setBillingError(err?.message || "Failed to load billing status.");
      return null;
    }
  }, []);

  useEffect(() => {
    refreshBillingStatus();
  }, [refreshBillingStatus]);
  useEffect(() => {
    if (!projectId) return;
    setProject(previous => ({ ...previous, projectId }));
  }, [projectId]);

  const value = useMemo(
    () => ({
      rooms: ROOMS,
      projectId: project.projectId,
      audioMetadata,
      setAudioMetadata,
      selectedStyle,
      setSelectedStyle,
      project,
      setProjectField,
      setProjectFields,
      applyControlProfile,
      billingStatus,
      billingError,
      refreshBillingStatus,
    }),
    [
      project.projectId,
      audioMetadata,
      selectedStyle,
      project,
      setProjectField,
      setProjectFields,
      applyControlProfile,
      billingStatus,
      billingError,
      refreshBillingStatus,
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
