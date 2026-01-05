import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectState } from "../state/ProjectContext";
import { uploadMedia, startGeneration, subscribeToJob } from "../api/videoGenerationApi";

const ui = {
  page: { maxWidth: 980, margin: "0 auto", display: "grid", gap: 16 },
  card: {
    background: "#141416",
    border: "1px solid #1f1f22",
    borderRadius: 14,
    padding: 16,
  },
  title: { fontSize: 22, fontWeight: 650, margin: "0 0 6px" },
  sub: { color: "#a7a7ad", margin: "0 0 16px", lineHeight: 1.4 },

  row: { display: "grid", gap: 10, marginBottom: 14 },
  label: { fontSize: 13, color: "#c7c7cc" },

  barWrap: {
    height: 12,
    borderRadius: 999,
    background: "#0f0f10",
    border: "1px solid #2b2b30",
    overflow: "hidden",
  },
  bar: pct => ({
    height: "100%",
    width: `${pct}%`,
    borderRadius: 999,
    background: "#3b82f6",
    transition: "width 180ms ease",
  }),
  statusPill: tone => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #2b2b30",
    background:
      tone === "good"
        ? "rgba(34,197,94,0.08)"
        : tone === "bad"
        ? "rgba(239,68,68,0.08)"
        : "rgba(59,130,246,0.08)",
    color: "#fff",
    fontSize: 12,
  }),

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  meta: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #2b2b30",
    background: "#0f0f10",
    color: "#c7c7cc",
    fontSize: 13,
    display: "grid",
    gap: 6,
  },

  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  button: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #2b2b30",
    background: "#1a1a1d",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 650,
  },
  primary: { background: "#3b82f6", borderColor: "#3b82f6" },
  danger: { background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)" },
  disabled: { opacity: 0.55, cursor: "not-allowed" },

  video: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid #2b2b30",
    background: "#0b0b0c",
  },

  error: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.08)",
    color: "#ffd2d2",
    fontSize: 13,
  },
};

function statusTone(status) {
  if (status === "completed") return "good";
  if (status === "failed" || status === "canceled") return "bad";
  return "info";
}

export default function Generate() {
  const navigate = useNavigate();
  const { project, setProjectField, markStepComplete } = useProjectState();

  const [phase, setPhase] = useState("idle");
  const [jobId, setJobId] = useState(project?.jobId || "");
  const [progress, setProgress] = useState(project?.progress || 0);
  const [status, setStatus] = useState(project?.jobStatus || "idle");
  const [error, setError] = useState(project?.jobError || "");

  const [previewUrl, setPreviewUrl] = useState(project?.previewVideoUrl || "");
  const [finalUrl, setFinalUrl] = useState(project?.finalVideoUrl || "");

  const visualMode = project?.visualMode || "visualizer";
  const performanceMode = project?.performanceMode || "auto";

  const canGenerate = useMemo(() => {
    if (!project?.audioFile) return false;
    if (visualMode === "performance" && !project?.performanceImageFile) return false;
    return true;
  }, [project?.audioFile, project?.performanceImageFile, visualMode]);

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

  useEffect(() => {
    if (typeof markStepComplete === "function") {
      const done = status === "completed" && !!(finalUrl || previewUrl);
      markStepComplete("generate", done);
    }
  }, [status, finalUrl, previewUrl, markStepComplete]);

  useEffect(() => {
    if (!jobId) return;
    if (status === "completed" || status === "failed") return;

    setPhase("running");

    const unsubscribe = subscribeToJob(jobId, {
      onStatus: msg => {
        setStatus(msg.status || "queued");
        setProgress(Number(msg.progress ?? 0));
      },
      onProgress: msg => {
        setStatus("running");
        setProgress(Number(msg.progress ?? 0));
      },
      onCompleted: msg => {
        setStatus("completed");
        setProgress(100);
        setPhase("completed");

        const result = msg.result || {};
        setPreviewUrl(result.previewVideoUrl || "");
        setFinalUrl(result.finalVideoUrl || "");

        setError("");
      },
      onFailed: msg => {
        setStatus("failed");
        setPhase("failed");
        setError(msg.error || "Generation failed.");
      },
      onError: () => {
        // Browser auto-reconnects; keep UI calm.
      },
    });

    return unsubscribe;
  }, [jobId, status]);

  async function handleGenerate() {
    setError("");
    setPreviewUrl("");
    setFinalUrl("");
    setProgress(0);

    try {
      setPhase("uploading");

      const uploadRes = await uploadMedia({
        audioFile: project.audioFile,
        imageFile: visualMode === "performance" ? project.performanceImageFile : null,
        visualMode,
      });

      setPhase("queued");
      const { jobId: newJobId } = await startGeneration({
        visualMode,
        performanceMode,
        audioRef: uploadRes.audioRef,
        performanceImageRef: uploadRes.performanceImageRef,
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
    } catch (e) {
      setPhase("failed");
      setStatus("failed");
      setError(e?.message || "Something went wrong starting generation.");
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
  }

  function goPreview() {
    navigate("/preview");
  }

  const pillTone = statusTone(status === "idle" ? phase : status);

  return (
    <div style={ui.page}>
      <section style={ui.card}>
        <h1 style={ui.title}>Generate</h1>
        <p style={ui.sub}>
          This creates your video as a job with live progress updates. For full songs, we render in segments to keep
          identity stable.
        </p>

        <div style={ui.grid2}>
          <div style={ui.meta}>
            <div>
              <span style={ui.label}>Mode</span>
            </div>
            <div style={{ color: "#fff", fontWeight: 650 }}>
              {visualMode === "performance"
                ? `Singing Performance (${performanceMode})`
                : visualMode === "narrative"
                ? "Narrative"
                : "Visualizer"}
            </div>
            <div style={{ color: "#8f8f96", fontSize: 12 }}>
              {project?.durationMode === "clip" ? `Clip (${project?.clipLength || 30}s)` : "Full song"}
            </div>
          </div>

          <div style={ui.meta}>
            <div>
              <span style={ui.label}>Job</span>
            </div>
            <div style={ui.statusPill(pillTone)}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#fff", opacity: 0.8 }} />
              <span>{status === "idle" ? phase : status}</span>
              {jobId ? <span style={{ color: "#a7a7ad" }}>#{jobId}</span> : null}
            </div>
            <div style={{ color: "#8f8f96", fontSize: 12 }}>
              Upload -> Queue -> Render segments -> Stitch -> Output
            </div>
          </div>
        </div>

        <div style={{ ...ui.row, marginTop: 14 }}>
          <div style={ui.barWrap} aria-label="Generation progress">
            <div style={ui.bar(Math.max(0, Math.min(100, Number(progress) || 0)))} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#a7a7ad", fontSize: 12 }}>
            <span>{progress}%</span>
            <span>
              {phase === "uploading"
                ? "Uploading media..."
                : phase === "queued"
                ? "Queued..."
                : phase === "running"
                ? "Rendering..."
                : ""}
            </span>
          </div>
        </div>

        {error ? <div style={ui.error}>{error}</div> : null}

        <div style={ui.actions}>
          {phase === "running" || phase === "queued" || phase === "uploading" ? (
            <button type="button" style={{ ...ui.button, ...ui.danger }} onClick={handleCancel}>
              Reset
            </button>
          ) : null}

          <button
            type="button"
            style={{ ...ui.button, ...ui.primary, ...(canGenerate ? {} : ui.disabled) }}
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            Generate
          </button>
        </div>
      </section>

      {previewUrl || finalUrl ? (
        <section style={ui.card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 650 }}>Output</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" style={ui.button} onClick={goPreview}>
                Go to Preview
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {finalUrl ? (
              <video style={ui.video} controls src={finalUrl} />
            ) : previewUrl ? (
              <video style={ui.video} controls src={previewUrl} />
            ) : null}

            <div style={{ color: "#8f8f96", fontSize: 12 }}>
              Tip: In the next phase we'll store outputs in object storage and generate signed URLs.
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
