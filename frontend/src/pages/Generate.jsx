import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useProjectState } from "../state/ProjectContext";
import { getJob, startGeneration, subscribeToJob, uploadMedia } from "../api/videoGenerationApi";
import { createCreditsCheckout, getJobEstimate } from "../api/billingApi";
import CreditMeter from "../components/CreditMeter";
import LowCreditsModal from "../components/LowCreditsModal";
import RoomLayout from "../components/RoomLayout";
import VisualTimelineStrip from "../components/VisualTimelineStrip";
import { getRoomPath } from "../state/projectState";
import { roomStyles } from "../ui/roomStyles";
import { theme } from "../ui/theme";

const ui = {
  card: {
    borderRadius: theme.radius,
    border: `1px solid ${theme.border}`,
    background: theme.panel2,
    padding: 16,
    display: "grid",
    gap: 16,
    boxShadow: theme.shadowSoft,
  },
  sectionTitle: {
    fontSize: theme.type.xs,
    fontWeight: 700,
    letterSpacing: 0.4,
    color: theme.gold,
    textTransform: "uppercase",
  },

  row: { display: "grid", gap: 10 },
  label: { fontSize: theme.type.xs, color: theme.muted },

  barWrap: {
    height: 12,
    borderRadius: 999,
    background: "#0f0f10",
    border: `1px solid ${theme.border2}`,
    overflow: "hidden",
  },
  bar: pct => ({
    height: "100%",
    width: `${pct}%`,
    borderRadius: 999,
    background: "linear-gradient(90deg, rgba(212,175,55,0.95), rgba(212,175,55,0.55))",
    transition: "width 180ms ease",
  }),
  statusPill: tone => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${
      tone === "good"
        ? "rgba(34,197,94,0.4)"
        : tone === "bad"
        ? "rgba(255,59,48,0.4)"
        : "rgba(212,175,55,0.3)"
    }`,
    background:
      tone === "good"
        ? "rgba(34,197,94,0.12)"
        : tone === "bad"
        ? "rgba(255,59,48,0.12)"
        : "rgba(212,175,55,0.12)",
    color: theme.text,
    fontSize: theme.type.xs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  }),
  statusDot: tone => ({
    width: 8,
    height: 8,
    borderRadius: 999,
    background: tone === "good" ? "#22c55e" : tone === "bad" ? theme.red : theme.gold,
    boxShadow:
      tone === "good"
        ? "0 0 0 3px rgba(34,197,94,0.18)"
        : tone === "bad"
        ? "0 0 0 3px rgba(255,59,48,0.2)"
        : "0 0 0 3px rgba(212,175,55,0.18)",
  }),

  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 },
  meta: {
    padding: "12px 14px",
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    color: theme.muted,
    fontSize: theme.type.sm,
    display: "grid",
    gap: 8,
  },
  metaValue: { color: theme.text, fontWeight: 700, fontSize: theme.type.base },
  metaHint: { color: theme.muted2, fontSize: theme.type.xs },

  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  button: {
    padding: "10px 14px",
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#1a1a1d",
    color: theme.text,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: theme.type.sm,
  },
  primary: {
    border: "1px solid rgba(212,175,55,0.8)",
    background: "linear-gradient(180deg, rgba(212,175,55,0.95), rgba(212,175,55,0.72))",
    color: "#0b0b0c",
  },
  danger: {
    border: "1px solid rgba(255,59,48,0.35)",
    background: "rgba(255,59,48,0.12)",
  },
  disabled: { opacity: 0.55, cursor: "not-allowed" },

  logCard: {
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    padding: 12,
    display: "grid",
    gap: 10,
  },
  logHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  logButton: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.border2}`,
    background: "transparent",
    color: theme.muted,
    fontSize: theme.type.xs,
    fontWeight: 700,
    cursor: "pointer",
  },
  logBody: {
    maxHeight: 180,
    overflow: "auto",
    display: "grid",
    gap: 8,
    paddingRight: 6,
  },
  logEntry: {
    display: "grid",
    gridTemplateColumns: "70px 1fr",
    gap: 10,
    fontSize: theme.type.xs,
  },
  logTime: { color: theme.muted2, fontVariantNumeric: "tabular-nums" },
  logText: { color: theme.text },
  logEmpty: { fontSize: theme.type.xs, color: theme.muted2 },
  alert: {
    marginTop: 14,
    borderRadius: theme.radius,
    border: "1px solid rgba(255,59,48,0.35)",
    background: "rgba(255,59,48,0.08)",
    padding: 12,
    display: "grid",
    gap: 6,
  },
  alertTitle: { fontSize: theme.type.base, fontWeight: 700, color: theme.text },
  alertList: { margin: 0, paddingLeft: 18, color: theme.muted, fontSize: theme.type.sm, lineHeight: 1.4 },
  alertItem: { marginBottom: 4 },
  alertHint: { fontSize: theme.type.sm, color: theme.muted2 },

  callout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 14px",
    borderRadius: theme.radius,
    border: "1px solid rgba(212,175,55,0.35)",
    background: "linear-gradient(180deg, rgba(212,175,55,0.08), rgba(18,18,20,0.9))",
  },
  calloutTitle: { fontSize: theme.type.base, fontWeight: 700, color: theme.text },
  calloutText: { fontSize: theme.type.sm, color: theme.muted },
  calloutButton: {
    padding: "10px 14px",
    borderRadius: theme.radius,
    border: "1px solid rgba(212,175,55,0.8)",
    background: "linear-gradient(180deg, rgba(212,175,55,0.95), rgba(212,175,55,0.72))",
    color: "#0b0b0c",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  video: {
    width: "100%",
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0b0b0c",
  },

  error: {
    padding: "10px 12px",
    borderRadius: theme.radius,
    border: "1px solid rgba(255,59,48,0.45)",
    background: "rgba(255,59,48,0.12)",
    color: "#ffd2d2",
    fontSize: theme.type.sm,
  },
  devBadge: {
    marginTop: 8,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(212,175,55,0.5)",
    background: "rgba(212,175,55,0.12)",
    color: theme.gold,
    fontSize: theme.type.xs,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
};

const PLAN_CREDITS = {
  free: 150,
  creator: 2000,
  studio: 6000,
  pro: 15000,
};
const TIMELINE_PHASES = ["Intro", "Verse", "Chorus", "Bridge", "Outro"];

function statusTone(status) {
  if (status === "completed") return "good";
  if (status === "failed" || status === "canceled") return "bad";
  return "info";
}

export default function Generate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { project, setProjectField, billingStatus, refreshBillingStatus } = useProjectState();

  const [phase, setPhase] = useState("idle");
  const [jobId, setJobId] = useState(project?.jobId || "");
  const [progress, setProgress] = useState(project?.progress || 0);
  const [status, setStatus] = useState(project?.jobStatus || "idle");
  const [error, setError] = useState(project?.jobError || "");

  const [previewUrl, setPreviewUrl] = useState(project?.previewVideoUrl || "");
  const [finalUrl, setFinalUrl] = useState(project?.finalVideoUrl || "");
  const [estimate, setEstimate] = useState(null);
  const [showLowCredits, setShowLowCredits] = useState(false);
  const [logEntries, setLogEntries] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const lastProgressMark = useRef(-1);
  const [completionNotified, setCompletionNotified] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState("");

  const visualMode = project?.mode || project?.visualMode || "visualizer";
  const performanceMode = project?.performanceMode || "auto";
  const exportQuality = project?.exportQuality || "1080p";
  const addOns = project?.addOns ?? {};
  const avatarCount = project?.avatarFiles?.length || 0;
  const isUnlimited = billingStatus?.unlimited;
  const isE2E = import.meta.env.VITE_E2E === "true";

  const addLog = useCallback(message => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogEntries(previous => {
      const next = [...previous, { id: `${Date.now()}-${Math.random()}`, time: timestamp, message }];
      return next.slice(-120);
    });
  }, []);

  const applyCompleted = useCallback(
    result => {
      const preview = result?.previewVideoUrl || result?.previewUrl || "";
      const final = result?.finalVideoUrl || result?.finalUrl || preview;

      setStatus("completed");
      setProgress(100);
      setPhase("completed");
      setPreviewUrl(preview);
      setFinalUrl(final);
      setError("");
      setProjectField("screeningComplete", false);
      if (activeVersionId) {
        setProjectField("renderVersions", previous =>
          (previous || []).map(version =>
            version.id === activeVersionId ? { ...version, status: "complete" } : version
          )
        );
      }
      addLog("Render completed.");
      refreshBillingStatus?.();
    },
    [activeVersionId, addLog, refreshBillingStatus, setProjectField]
  );

  const applyFailed = useCallback(
    message => {
      const msg = message || "Generation failed.";
      setStatus("failed");
      setPhase("failed");
      setError(msg);
      if (activeVersionId) {
        setProjectField("renderVersions", previous =>
          (previous || []).map(version =>
            version.id === activeVersionId ? { ...version, status: "failed" } : version
          )
        );
      }
      addLog(`Failed: ${msg}`);
      refreshBillingStatus?.();
    },
    [activeVersionId, addLog, refreshBillingStatus, setProjectField]
  );

  const fetchJobResult = useCallback(
    async currentJobId => {
      if (!currentJobId || status === "completed" || status === "failed") return;
      try {
        const job = await getJob(currentJobId);
        const jobStatus = job?.status || "queued";
        if (jobStatus === "completed") {
          const result = job?.result || job?.returnvalue || {};
          applyCompleted(result);
        } else if (jobStatus === "failed") {
          applyFailed(job?.failedReason || job?.error || "Generation failed.");
        }
      } catch {
      }
    },
    [applyCompleted, applyFailed, status]
  );

  const canGenerate = useMemo(() => {
    if (!project?.audioFile) return false;
    const hasPerformanceSource =
      !!project?.performanceImageFile || (project?.avatarFiles?.length || 0) > 0;
    if (visualMode === "performance" && performanceMode !== "auto" && !hasPerformanceSource) {
      return false;
    }
    return true;
  }, [
    performanceMode,
    project?.audioFile,
    project?.performanceImageFile,
    project?.avatarFiles,
    visualMode,
  ]);

  const autoPerformanceNoAssets =
    visualMode === "performance" &&
    performanceMode === "auto" &&
    !project?.performanceImageFile &&
    !(project?.avatarFiles?.length > 0);
  const autoNoteLogged = useRef(false);

  useEffect(() => {
    if (autoPerformanceNoAssets && !autoNoteLogged.current) {
      console.info("Quick Forge: auto performance running without avatar assets.");
      autoNoteLogged.current = true;
    }
  }, [autoPerformanceNoAssets]);

  const featureWarnings = useMemo(() => {
    if (!billingStatus || billingStatus.unlimited) return [];
    const warnings = [];
    const features = billingStatus.features || {};
    const planName = billingStatus.plan || "creator";

    if (exportQuality === "4k" && !features.export4k) {
      warnings.push("4K export requires Studio or Pro.");
    }
    if (addOns?.faceLockPlus && !features.faceLockPlus) {
      warnings.push("Face Lock+ requires Studio or Pro.");
    }
    if (addOns?.earlyAccessModels && !features.earlyAccessModels) {
      warnings.push("Early access models require Pro.");
    }
    if (planName === "free" && exportQuality !== "preview") {
      warnings.push("Free plan supports preview renders only.");
    }
    if (planName === "free" && visualMode === "performance" && exportQuality !== "preview") {
      warnings.push("Free plan supports Singing Performance previews only.");
    }

    return warnings;
  }, [addOns, billingStatus, exportQuality, visualMode]);

  useEffect(() => {
    let active = true;
    async function loadEstimate() {
      try {
        const estimateRes = await getJobEstimate({
          visualMode,
          exportQuality,
          addOns,
          avatarCount,
        });
        if (active) setEstimate(estimateRes);
      } catch {
        if (active) setEstimate(null);
      }
    }

    loadEstimate();
    return () => {
      active = false;
    };
  }, [visualMode, exportQuality, addOns, avatarCount]);

  useEffect(() => {
    if (typeof setProjectField === "function") {
      setProjectField("jobId", jobId);
      setProjectField("progress", progress);
      setProjectField("jobStatus", status);
      setProjectField("jobError", error);
      setProjectField("previewVideoUrl", previewUrl);
      setProjectField("finalVideoUrl", finalUrl);
    }
  }, [jobId, progress, status, error, previewUrl, finalUrl, setProjectField]);

  const hasOutput = Boolean(previewUrl || finalUrl);

  useEffect(() => {
    if (status !== "completed" || !hasOutput) {
      setCompletionNotified(false);
      return;
    }
    if (completionNotified) return;
    setCompletionNotified(true);
    navigate(location.pathname, {
      replace: true,
      state: { toast: "Render complete. Screening Room unlocked." },
    });
  }, [completionNotified, hasOutput, location.pathname, navigate, status]);

  useEffect(() => {
    if (!jobId) return;
    if (status === "completed" || status === "failed") return;

    setPhase("running");
    addLog(`Listening to job ${jobId}`);

    let active = true;
    const fallbackTimer = setTimeout(() => {
      if (active) {
        fetchJobResult(jobId);
      }
    }, 3000);

    const unsubscribe = subscribeToJob(jobId, {
      onStatus: msg => {
        const nextStatus = msg.status || "queued";
        setStatus(nextStatus);
        setProgress(Number(msg.progress ?? 0));
        addLog(`Status: ${nextStatus}`);
      },
      onProgress: msg => {
        const pct = Number(msg.progress ?? 0);
        setStatus("running");
        setProgress(pct);
        const mark = Math.floor(pct / 10);
        if (mark !== lastProgressMark.current) {
          lastProgressMark.current = mark;
          addLog(`Progress: ${pct}%`);
        }
      },
      onCompleted: msg => {
        clearTimeout(fallbackTimer);
        applyCompleted(msg.result || {});
      },
      onFailed: msg => {
        clearTimeout(fallbackTimer);
        applyFailed(msg.error || "Generation failed.");
      },
      onError: () => {
        fetchJobResult(jobId);
      },
    });

    return () => {
      active = false;
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, [jobId, status, addLog, applyCompleted, applyFailed, fetchJobResult]);

  async function handleGenerate() {
    setError("");
    setPreviewUrl("");
    setFinalUrl("");
    setProgress(0);
    setShowLowCredits(false);
    setLogEntries([]);
    setLogOpen(true);
    lastProgressMark.current = -1;
    setProjectField("screeningComplete", false);
    const versionId = `render-${Date.now()}`;
    setActiveVersionId(versionId);
    setProjectField("renderVersions", previous => [
      { id: versionId, status: "rendering", label: `Render ${new Date().toLocaleTimeString()}` },
      ...(previous || []),
    ]);

    try {
      const billing = billingStatus || (await refreshBillingStatus?.());
      if (!billing) {
        setError("Unable to load billing status.");
        addLog("Unable to load billing status.");
        return;
      }

      const estimatePayload = {
        visualMode,
        exportQuality,
        addOns,
        avatarCount,
      };
      const estimateRes = await getJobEstimate(estimatePayload);
      setEstimate(estimateRes);
      addLog("Estimate loaded.");

      const unlimited = billing.unlimited;
      if (!unlimited) {
        const balance = billing.creditsBalance ?? 0;
        const planCap = PLAN_CREDITS[billing.plan] || PLAN_CREDITS.creator;
        const lowThreshold = Math.ceil(planCap * 0.15);

        if (balance < estimateRes.reserveCredits || balance < lowThreshold) {
          addLog("Low credits. Prompting top-up.");
          setShowLowCredits(true);
          return;
        }
      }

      setPhase("uploading");
      addLog("Uploading media.");

      const uploadRes = await uploadMedia({
        audioFile: project.audioFile,
        imageFile: visualMode === "performance" ? project.performanceImageFile : null,
        avatarFiles: project?.avatarFiles || [],
        visualMode,
      });
      addLog("Upload complete. Queueing job.");

      setPhase("queued");
      const { jobId: newJobId } = await startGeneration({
        visualMode,
        performanceMode,
        audioRef: uploadRes.audioRef,
        performanceImageRef: uploadRes.performanceImageRef,
        avatarPackRefs: uploadRes.avatarPackRefs || [],
        exportQuality,
        addOns,
        renderParams: project?.renderParams || {},
        controlProfile: project?.controlProfile || "cinematic",
        segments: project?.durationMode === "clip" ? 6 : 12,
        lyrics: project?.lyrics || "",
        title: project?.title || "",
        artist: project?.artist || "",
        durationMode: project?.durationMode || "full",
        clipLength: project?.clipLength || 30,
      });

      setJobId(newJobId);
      setStatus("queued");
      setProgress(0);
      setPhase("running");
      addLog(`Job queued: ${newJobId}`);
    } catch (e) {
      setPhase("failed");
      setStatus("failed");
      const message = e?.message || "Something went wrong starting generation.";
      setError(message);
      addLog(`Failed to start: ${message}`);
    }
  }

  async function handleCancel() {
    setJobId("");
    setProgress(0);
    setStatus("idle");
    setPhase("idle");
    setError("");
    setPreviewUrl("");
    setFinalUrl("");
    setProjectField("screeningComplete", false);
    addLog("Render reset.");
    if (activeVersionId) {
      setProjectField("renderVersions", previous =>
        (previous || []).map(version =>
          version.id === activeVersionId ? { ...version, status: "failed" } : version
        )
      );
    }
  }

  function mockRenderComplete() {
    const versionId = `render-mock-${Date.now()}`;
    setActiveVersionId(versionId);
    setProjectField("screeningComplete", false);
    setProjectField("renderVersions", previous => [
      { id: versionId, status: "complete", label: "Render mock" },
      ...(previous || []),
    ]);
    setStatus("completed");
    setProgress(100);
    setPhase("completed");
    setPreviewUrl("/mock-preview.mp4");
    setFinalUrl("/mock-preview.mp4");
    setError("");
    addLog("Mock render complete.");
  }

  async function handleCreditsCheckout(packKey) {
    try {
      const { url } = await createCreditsCheckout(packKey);
      window.location.href = url;
    } catch (err) {
      setError(err?.message || "Unable to start checkout.");
    }
  }

  const pillTone = statusTone(status === "idle" ? phase : status);
  const progressValue = Math.max(0, Math.min(100, Number(progress) || 0));
  const reserveNeeded = estimate?.reserveCredits ?? 0;
  const creditsBalance = billingStatus?.creditsBalance ?? 0;
  const creditsShort = isUnlimited ? 0 : Math.max(0, reserveNeeded - creditsBalance);
  const generateLabel =
    creditsShort > 0 ? `Generate (needs +${creditsShort} credits)` : "Generate";

  const canContinue = hasOutput;
  const footer = (
    <>
      <button
        type="button"
        style={roomStyles.button}
        onClick={() => navigate(getRoomPath(projectId, "stage"))}
      >
        Back
      </button>
      <button
        type="button"
        style={{ ...roomStyles.button, ...roomStyles.buttonPrimary, ...(canContinue ? {} : roomStyles.buttonDisabled) }}
        disabled={!canContinue}
        onClick={() => navigate(getRoomPath(projectId, "screening"))}
      >
        Screen Cut
      </button>
    </>
  );

  return (
    <RoomLayout
      title="Render Floor"
      purpose="Roll the render with transparent progress, logs, and budget usage."
      footer={footer}
      ariaLabel="Render Floor"
    >
      <section style={roomStyles.section}>
        <h2 style={roomStyles.sectionTitle}>Render console</h2>
        <div style={ui.grid2}>
          <div style={ui.meta}>
            <span style={ui.label}>Mode</span>
            <div style={ui.metaValue}>
              {visualMode === "performance"
                ? `Singing Performance (${performanceMode})`
                : visualMode === "narrative"
                ? "Narrative"
                : "Visualizer"}
            </div>
            <div style={ui.metaHint}>
              {project?.durationMode === "clip" ? `Clip (${project?.clipLength || 30}s)` : "Full song"}
            </div>
          </div>

          <div style={ui.meta}>
            <span style={ui.label}>Render status</span>
            <div style={ui.statusPill(pillTone)}>
              <span style={ui.statusDot(pillTone)} aria-hidden="true" />
              <span>{status === "idle" ? phase : status}</span>
              {jobId ? <span style={ui.metaHint}>#{jobId}</span> : null}
            </div>
            <div style={ui.metaHint}>{"Upload → Queue → Render → Output"}</div>
          </div>
        </div>

        <VisualTimelineStrip phases={TIMELINE_PHASES} progress={progressValue} />

        {billingStatus ? (
          <div style={{ marginTop: 14 }}>
            <CreditMeter
              credits={billingStatus.creditsBalance}
              plan={billingStatus.plan}
              unlimited={billingStatus.unlimited}
            />
            {billingStatus.unlimited ? <div style={ui.devBadge}>Dev mode: unlimited credits</div> : null}
          </div>
        ) : null}

        {featureWarnings.length ? (
          <div style={ui.alert} role="alert">
            <div style={ui.alertTitle}>Feature entitlement required</div>
            <ul style={ui.alertList}>
              {featureWarnings.map((warning, index) => (
                <li key={`${warning}-${index}`} style={ui.alertItem}>
                  {warning}
                </li>
              ))}
            </ul>
            <div style={ui.alertHint}>Switch profile, disable add-ons, or upgrade plan before rendering.</div>
          </div>
        ) : null}

        {autoPerformanceNoAssets ? (
          <div style={ui.alert} role="status">
            <div style={ui.alertTitle}>Auto performance without avatars</div>
            <div style={ui.alertHint}>
              Running with generated performer. Add avatar assets in Cast Room for tighter casting.
            </div>
          </div>
        ) : null}

        <div style={ui.row}>
          <span style={roomStyles.sectionTitle}>Progress</span>
          <div style={ui.barWrap} aria-label="Generation progress">
            <div style={ui.bar(progressValue)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: theme.muted, fontSize: theme.type.xs }}>
            <span>{progressValue}%</span>
            <span>
              {phase === "uploading"
                ? "Uploading media..."
                : phase === "queued"
                ? "Queued..."
                : phase === "running"
                ? "Rendering..."
                : phase === "completed"
                ? "Render complete"
                : ""}
            </span>
          </div>
        </div>

        {estimate ? (
          <div style={{ color: theme.muted2, fontSize: theme.type.xs }}>
            Estimated: {estimate.estimateCredits} credits (reserve {estimate.reserveCredits}).
          </div>
        ) : null}

        <div style={ui.logCard}>
          <div style={ui.logHeader}>
            <span style={roomStyles.sectionTitle}>Event log</span>
            <button
              type="button"
              style={ui.logButton}
              aria-expanded={logOpen}
              onClick={() => setLogOpen(previous => !previous)}
            >
              {logOpen ? "Collapse" : "Expand"}
            </button>
          </div>
          {logOpen ? (
            <div style={ui.logBody}>
              {logEntries.length ? (
                logEntries.map(entry => (
                  <div key={entry.id} style={ui.logEntry}>
                    <span style={ui.logTime}>{entry.time}</span>
                    <span style={ui.logText}>{entry.message}</span>
                  </div>
                ))
              ) : (
                <div style={ui.logEmpty}>No events yet.</div>
              )}
            </div>
          ) : (
            <div style={ui.logEmpty}>Logs hidden. Expand to view recent events.</div>
          )}
        </div>

        {error ? <div style={ui.error}>{error}</div> : null}

        <div style={ui.actions}>
          {phase === "running" || phase === "queued" || phase === "uploading" ? (
            <button type="button" style={{ ...ui.button, ...ui.danger }} onClick={handleCancel}>
              Reset
            </button>
          ) : null}

          {isE2E ? (
            <button type="button" style={{ ...ui.button, ...ui.primary }} onClick={mockRenderComplete}>
              Mock render
            </button>
          ) : null}

          <button
            type="button"
            style={{ ...ui.button, ...ui.primary, ...(canGenerate ? {} : ui.disabled) }}
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            {generateLabel}
          </button>
        </div>
      </section>

      {hasOutput ? (
        <section style={roomStyles.section}>
          <h2 style={roomStyles.sectionTitle}>Output</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {finalUrl ? (
              <video style={ui.video} controls src={finalUrl} />
            ) : previewUrl ? (
              <video style={ui.video} controls src={previewUrl} />
            ) : null}

            <div style={{ color: theme.muted2, fontSize: theme.type.xs }}>
              Tip: outputs are stored as versions for screening and delivery.
            </div>
          </div>
        </section>
      ) : null}

      {hasOutput ? (
        <section style={roomStyles.section}>
          <h2 style={roomStyles.sectionTitle}>Next action</h2>
          <div style={ui.callout}>
            <div>
              <div style={ui.calloutTitle}>Screening Room unlocked</div>
              <div style={ui.calloutText}>Review the cut and prep delivery.</div>
            </div>
            <button
              type="button"
              style={ui.calloutButton}
              onClick={() => navigate(getRoomPath(projectId, "screening"))}
            >
              Go to Screening Room
            </button>
          </div>
        </section>
      ) : null}

      <LowCreditsModal
        isOpen={showLowCredits && !isUnlimited}
        onClose={() => setShowLowCredits(false)}
        onGoPricing={() => setShowLowCredits(false)}
        onCheckoutCredits={handleCreditsCheckout}
        onUpgradePlan={() => setShowLowCredits(false)}
        estimate={estimate}
        credits={billingStatus?.creditsBalance}
        plan={billingStatus?.plan}
      />
    </RoomLayout>
  );
}
