import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreditMeter from "../components/CreditMeter";
import RoomLayout from "../components/RoomLayout";
import RoomStepper from "../components/RoomStepper";
import VideoPreview from "../components/VideoPreview";
import { useProjectState } from "../state/ProjectContext";
import {
  getNextActionRoom,
  getProjectFlags,
  getRoomPath,
} from "../state/projectState";
import { roomStyles } from "../ui/roomStyles";
import { theme } from "../ui/theme";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function isAudioAllowed(file) {
  if (!file) return false;
  const typeOk = ["audio/mpeg", "audio/wav", "audio/x-wav"].includes(file.type);
  const nameOk = /\.(mp3|wav)$/i.test(file.name);
  return typeOk || nameOk;
}

const styles = {
  split: { display: "grid", gap: 14 },
  splitTwo: { display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" },
  statusCard: {
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    padding: 14,
    display: "grid",
    gap: 8,
  },
  statusLabel: { fontSize: theme.type.xs, color: theme.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  statusValue: { fontSize: theme.type.base, fontWeight: 700 },
  list: { display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "8px 10px",
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    fontSize: theme.type.sm,
  },
  badge: tone => ({
    padding: "4px 8px",
    borderRadius: 999,
    border: `1px solid ${
      tone === "good"
        ? "rgba(34,197,94,0.4)"
        : tone === "bad"
        ? "rgba(255,59,48,0.4)"
        : "rgba(212,175,55,0.4)"
    }`,
    background:
      tone === "good"
        ? "rgba(34,197,94,0.12)"
        : tone === "bad"
        ? "rgba(255,59,48,0.12)"
        : "rgba(212,175,55,0.12)",
    color: theme.text,
    fontSize: theme.type.xs,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  }),
  empty: { fontSize: theme.type.sm, color: theme.muted2 },
  nextAction: {
    borderRadius: theme.radius,
    border: `1px solid rgba(212,175,55,0.35)`,
    background: "linear-gradient(180deg, rgba(212,175,55,0.1), rgba(15,15,18,0.9))",
    padding: 16,
    display: "grid",
    gap: 10,
  },
  nextActionLabel: {
    fontSize: theme.type.xs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: theme.muted,
  },
  nextActionTitle: {
    fontSize: theme.type.base,
    fontWeight: 700,
  },
  nextActionButton: {
    ...roomStyles.button,
    ...roomStyles.buttonPrimary,
    width: "fit-content",
  },
  quickCard: {
    borderRadius: theme.radius,
    border: `1px solid rgba(212,175,55,0.45)`,
    background: "linear-gradient(180deg, rgba(212,175,55,0.08), rgba(12,12,14,0.9))",
    padding: 18,
    display: "grid",
    gap: 16,
    boxShadow: theme.shadowSoft,
  },
  quickHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  quickTitles: { display: "grid", gap: 4 },
  quickBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid rgba(212,175,55,0.4)`,
    background: "rgba(212,175,55,0.12)",
    color: theme.gold,
    fontSize: theme.type.xs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontWeight: 700,
  },
  quickTitle: { fontSize: theme.type.lg, fontWeight: 800 },
  quickSubtitle: { color: theme.muted2 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 },
  quickGroup: { display: "grid", gap: 10 },
  quickLabel: { fontSize: theme.type.xs, color: theme.muted, letterSpacing: 0.3, textTransform: "uppercase" },
  quickDrop: {
    borderRadius: theme.radius,
    border: `1px dashed rgba(212,175,55,0.5)`,
    background: "rgba(12,12,14,0.9)",
    padding: 16,
    display: "grid",
    gap: 6,
    cursor: "pointer",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  quickDropActive: {
    borderColor: "rgba(212,175,55,0.9)",
    background: "rgba(212,175,55,0.08)",
  },
  quickHint: { color: theme.muted2, fontSize: theme.type.sm },
  quickPills: { display: "flex", gap: 8, flexWrap: "wrap" },
  quickPill: active => ({
    padding: "8px 12px",
    borderRadius: 999,
    border: `1px solid ${active ? "rgba(212,175,55,0.7)" : theme.border2}`,
    background: active ? "rgba(212,175,55,0.15)" : "#0f0f10",
    color: active ? theme.text : theme.muted,
    fontWeight: active ? 700 : 600,
    cursor: "pointer",
  }),
  quickSelect: {
    padding: "10px 12px",
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    color: theme.text,
  },
  quickTextarea: {
    width: "100%",
    minHeight: 96,
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    color: theme.text,
    padding: 12,
    resize: "vertical",
  },
  quickCTA: {
    display: "grid",
    gap: 8,
    padding: 12,
    borderRadius: theme.radius,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
  },
  quickButton: enabled => ({
    padding: "12px 14px",
    borderRadius: theme.radius,
    border: `1px solid ${enabled ? "rgba(212,175,55,0.8)" : theme.border2}`,
    background: enabled
      ? "linear-gradient(180deg, rgba(212,175,55,0.95), rgba(212,175,55,0.72))"
      : "#0f0f10",
    color: enabled ? "#0b0b0c" : theme.muted,
    fontWeight: 800,
    cursor: enabled ? "pointer" : "not-allowed",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  }),
  quickSecondaryActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  quickSecondary: {
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${theme.border2}`,
    background: "#0f0f10",
    color: theme.muted,
    fontSize: theme.type.sm,
    cursor: "pointer",
  },
};

function statusTone(label) {
  if (label === "Master delivered") return "good";
  if (label === "Cut pending review") return "info";
  if (label === "Session ready to render") return "info";
  if (label === "Stage lighting queued.") return "info";
  if (label === "Direction pending. Set the mode.") return "info";
  if (label === "Cast pending review.") return "info";
  return "bad";
}

export default function ControlRoom() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { project, billingStatus, setProjectField, setProjectFields, applyControlProfile } =
    useProjectState();
  const audioInputRef = useRef(null);
  const [audioFile, setAudioFile] = useState(project?.audioFile || null);
  const [audioDragOver, setAudioDragOver] = useState(false);
  const [durationMode, setDurationMode] = useState(project?.durationMode || "full");
  const [vibePrompt, setVibePrompt] = useState(project?.quickForgePrompt || "");
  const [avatarChoice, setAvatarChoice] = useState("auto");
  const [styleChoice, setStyleChoice] = useState(project?.controlProfile || "cinematic");
  const [quickError, setQuickError] = useState("");
  const [quickWarning, setQuickWarning] = useState("");

  const flags = useMemo(() => getProjectFlags(project), [project]);
  const nextRoom = useMemo(() => getNextActionRoom(project), [project]);
  const nextPath = useMemo(
    () => getRoomPath(projectId, nextRoom?.id || "recording"),
    [projectId, nextRoom]
  );

  const statusLabel = useMemo(() => {
    if (!flags.audioUploaded) return "Your session needs a track to begin.";
    if (!flags.mode) return "Direction pending. Set the mode.";
    if (flags.mode === "performance" && !flags.avatarSelected) return "Cast pending review.";
    if (!flags.styleComplete) return "Stage lighting queued.";
    if (!flags.renderComplete) return "Session ready to render";
    if (!flags.exportVersions.length) return "Cut pending review";
    return "Master delivered";
  }, [flags]);

  const previewUrl = project?.finalVideoUrl || project?.previewVideoUrl || "";
  const renderVersions = project?.renderVersions || [];
  const exportVersions = project?.exportVersions || [];
  const audioValid = Boolean(audioFile && isAudioAllowed(audioFile));

  const styleOptions = useMemo(
    () => [
      { id: "cinematic", label: "Cinematic", description: "Film grain, controlled cuts.", profileId: "cinematic" },
      { id: "dreamy", label: "Dreamy", description: "Soft focus, floaty camera.", profileId: "moody" },
      { id: "gritty", label: "Gritty", description: "Handheld energy, texture.", profileId: "hype" },
      { id: "pop", label: "Pop", description: "Clean stage, bright color.", profileId: "safe" },
    ],
    []
  );

  useEffect(() => {
    // keep local UI in sync if user edits from inspector
    if (project?.durationMode && project.durationMode !== durationMode) {
      setDurationMode(project.durationMode);
    }
    if (project?.quickForgePrompt && project.quickForgePrompt !== vibePrompt) {
      setVibePrompt(project.quickForgePrompt);
    }
    if (project?.controlProfile && project.controlProfile !== styleChoice) {
      setStyleChoice(project.controlProfile);
    }
    if (project?.audioFile && project.audioFile !== audioFile) {
      setAudioFile(project.audioFile);
    }
  }, [audioFile, durationMode, project, styleChoice, vibePrompt]);

  useEffect(() => {
    setProjectFields({
      audioFile,
      audioUploaded: audioValid,
      durationMode,
      clipLength: project?.clipLength || 30,
      quickForgePrompt: vibePrompt,
    });
  }, [audioFile, audioValid, durationMode, project?.clipLength, setProjectFields, vibePrompt]);

  useEffect(() => {
    const chosen = styleOptions.find(option => option.id === styleChoice);
    if (!chosen) return;
    applyControlProfile(chosen.profileId);
    setProjectFields({
      controlProfile: chosen.profileId,
      styleComplete: true,
    });
  }, [applyControlProfile, setProjectFields, styleChoice, styleOptions]);

  function pickAudio() {
    setQuickError("");
    audioInputRef.current?.click();
  }

  function selectFirstValidFile(fileList) {
    if (!fileList || !fileList.length) return null;
    for (const file of Array.from(fileList)) {
      if (isAudioAllowed(file)) return file;
    }
    return null;
  }

  function handleAudio(fileListOrFile) {
    setQuickWarning("");
    setQuickError("");
    const file = fileListOrFile?.length ? selectFirstValidFile(fileListOrFile) : fileListOrFile;
    if (!file) {
      setAudioFile(null);
      setQuickError("Please upload an MP3 or WAV file.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setQuickWarning("Very long audio may be trimmed during processing.");
    }
    setAudioFile(file);
  }

  function handleForge() {
    if (!audioValid) {
      setQuickError("Add audio to forge a cut.");
      return;
    }
    const chosenStyle = styleOptions.find(option => option.id === styleChoice);
    const visualMode = avatarChoice === "auto" ? "performance" : "visualizer";
    setProjectFields({
      audioFile,
      audioUploaded: audioValid,
      durationMode,
      mode: visualMode,
      visualMode,
      performanceMode: avatarChoice === "auto" ? "auto" : project?.performanceMode || "auto",
      controlProfile: chosenStyle?.profileId || project?.controlProfile || "cinematic",
      quickForgePrompt: vibePrompt,
      quickForgeSeeded: true,
      clipLength: project?.clipLength || 30,
    });
    navigate(getRoomPath(projectId, "render"));
  }

  const footer = (
    <>
      <button type="button" style={{ ...roomStyles.button, ...roomStyles.buttonDisabled }} disabled>
        Back
      </button>
      <button
        type="button"
        style={{ ...roomStyles.button, ...roomStyles.buttonPrimary }}
        onClick={() => navigate(nextPath)}
      >
        {nextRoom?.ctaLabel || "Enter Booth"}
      </button>
    </>
  );

  return (
    <RoomLayout
      title="Control Room"
      purpose="Session overview, next actions, versions, and budget health."
      footer={footer}
      ariaLabel="Control Room"
    >
      <section style={roomStyles.section}>
        <div style={styles.quickCard}>
          <div style={styles.quickHeader}>
            <div style={styles.quickTitles}>
              <div style={styles.quickBadge}>Quick Forge</div>
              <div style={styles.quickTitle}>Forge a music video in one step.</div>
              <div style={styles.quickSubtitle}>Drop in your track, set the vibe, and jump to render.</div>
            </div>
          </div>
          <div style={styles.quickGrid}>
            <div style={styles.quickGroup}>
              <div style={styles.quickLabel}>Audio</div>
              <div
                style={{ ...styles.quickDrop, ...(audioDragOver ? styles.quickDropActive : {}) }}
                onDragOver={event => {
                  event.preventDefault();
                  setAudioDragOver(true);
                }}
                onDragLeave={() => setAudioDragOver(false)}
                onDrop={event => {
                  event.preventDefault();
                  setAudioDragOver(false);
                  handleAudio(event.dataTransfer.files);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={event => (event.key === "Enter" || event.key === " ") && pickAudio()}
                onClick={pickAudio}
                aria-label="Upload audio file for Quick Forge"
              >
                {audioFile && audioValid ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong>{audioFile.name}</strong>
                    <span style={roomStyles.pill}>{audioFile.type || "audio"}</span>
                    <span style={styles.quickHint}>{formatBytes(audioFile.size)}</span>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 700 }}>Drag & drop your song</div>
                    <div style={styles.quickHint}>MP3 or WAV • audio drives everything</div>
                  </>
                )}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  style={{ display: "none" }}
                  onChange={event => handleAudio(event.target.files)}
                />
              </div>
              <div style={styles.quickLabel}>Duration</div>
              <div style={styles.quickPills}>
                {["full", "clip"].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    style={styles.quickPill(durationMode === mode)}
                    onClick={() => setDurationMode(mode)}
                  >
                    {mode === "full" ? "Full song" : "Clip"}
                  </button>
                ))}
              </div>
              <div style={styles.quickLabel}>Vibe prompt (optional)</div>
              <textarea
                style={styles.quickTextarea}
                placeholder="Moody neon performance, slow camera, intimate..."
                value={vibePrompt}
                onChange={event => setVibePrompt(event.target.value)}
              />
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <div style={styles.quickGroup}>
                <div style={styles.quickLabel}>Avatar</div>
                <select
                  style={styles.quickSelect}
                  value={avatarChoice}
                  onChange={event => setAvatarChoice(event.target.value)}
                >
                  <option value="last">Last used avatar</option>
                  <option value="auto">Auto-generate performer</option>
                  <option value="choose">Choose from Avatar Room</option>
                </select>
              </div>

              <div style={styles.quickGroup}>
                <div style={styles.quickLabel}>Style</div>
                <div style={styles.quickPills}>
                  {styleOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      style={styles.quickPill(styleChoice === option.id)}
                      onClick={() => setStyleChoice(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div style={styles.quickHint}>
                  {styleOptions.find(option => option.id === styleChoice)?.description ||
                    "Choose a control profile to match the vibe."}
                </div>
              </div>

              <div style={styles.quickCTA}>
                <div style={{ color: theme.muted2, fontSize: theme.type.sm }}>
                  Sets your control profile and drops you into Render Floor.
                </div>
                <button
                  type="button"
                  style={styles.quickButton(audioValid)}
                  disabled={!audioValid}
                  onClick={handleForge}
                >
                  🎬 Forge Video
                </button>
                {quickError ? (
                  <div style={{ color: theme.red, fontSize: theme.type.sm }}>{quickError}</div>
                ) : null}
                {quickWarning ? (
                  <div style={{ color: theme.muted, fontSize: theme.type.sm }}>{quickWarning}</div>
                ) : null}
                {avatarChoice === "auto" && (
                  <div style={styles.quickHint}>
                    Auto performance uses a generated performer if no avatar assets are set.
                  </div>
                )}
                <div style={styles.quickSecondaryActions}>
                  <button
                    type="button"
                    style={styles.quickSecondary}
                    onClick={() => navigate(getRoomPath(projectId, "cast"))}
                  >
                    🎭 Edit Avatar
                  </button>
                  <button
                    type="button"
                    style={styles.quickSecondary}
                    onClick={() => navigate(getRoomPath(projectId, "direction"))}
                  >
                    🎞️ Adjust Scenes
                  </button>
                  <button
                    type="button"
                    style={styles.quickSecondary}
                    onClick={() => navigate(getRoomPath(projectId, "stage"))}
                  >
                    🎨 Change Style
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={roomStyles.section}>
        <h2 style={roomStyles.sectionTitle}>Session details</h2>
        <div style={roomStyles.twoCol}>
          <div style={roomStyles.row}>
            <label style={roomStyles.label} htmlFor="projectTitle">
              Project name
            </label>
            <input
              id="projectTitle"
              style={roomStyles.input}
              value={project?.title || ""}
              onChange={event => setProjectField("title", event.target.value)}
              placeholder="Name the session"
            />
          </div>
          <div style={roomStyles.row}>
            <label style={roomStyles.label} htmlFor="projectArtist">
              Artist
            </label>
            <input
              id="projectArtist"
              style={roomStyles.input}
              value={project?.artist || ""}
              onChange={event => setProjectField("artist", event.target.value)}
              placeholder="Artist or project owner"
            />
          </div>
        </div>
        <div style={roomStyles.row}>
          <label style={roomStyles.label} htmlFor="projectNotes">
            Session notes
          </label>
          <textarea
            id="projectNotes"
            style={roomStyles.textarea}
            value={project?.notes || ""}
            onChange={event => setProjectField("notes", event.target.value)}
            placeholder="What should the team remember about this session?"
          />
        </div>
      </section>

      <section style={roomStyles.section}>
        <h2 style={roomStyles.sectionTitle}>Progress</h2>
        <div style={styles.splitTwo}>
          <RoomStepper currentRoomId="control" />
          <div style={styles.statusCard}>
            <div style={styles.statusLabel}>Session status</div>
            <div style={styles.statusValue}>{statusLabel}</div>
            <div style={styles.badge(statusTone(statusLabel))}>
              {flags.renderComplete ? "Output ready" : "In progress"}
            </div>
          </div>
        </div>
        <div style={styles.nextAction}>
          <div style={styles.nextActionLabel}>Next action</div>
          <div style={styles.nextActionTitle}>{nextRoom?.label || "Recording Booth"}</div>
          <button type="button" style={styles.nextActionButton} onClick={() => navigate(nextPath)}>
            {nextRoom?.ctaLabel || "Enter Booth"}
          </button>
        </div>
      </section>

      <section style={roomStyles.section}>
        <h2 style={roomStyles.sectionTitle}>Latest cut</h2>
        {previewUrl ? (
          <VideoPreview src={previewUrl} />
        ) : (
          <div style={styles.empty}>No render yet. Upload audio to begin the session.</div>
        )}
      </section>

      <section style={roomStyles.section}>
        <h2 style={roomStyles.sectionTitle}>Versions & exports</h2>
        <div style={styles.splitTwo}>
          <div style={styles.split}>
            <div style={roomStyles.label}>Render versions</div>
            {renderVersions.length ? (
              <ul style={styles.list}>
                {renderVersions.map(version => (
                  <li key={version.id} style={styles.listItem}>
                    <span>{version.label || "Render cut"}</span>
                    <span style={styles.badge(version.status === "complete" ? "good" : version.status === "failed" ? "bad" : "info")}>
                      {version.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={styles.empty}>No renders yet.</div>
            )}
          </div>
          <div style={styles.split}>
            <div style={roomStyles.label}>Export versions</div>
            {exportVersions.length ? (
              <ul style={styles.list}>
                {exportVersions.map(version => (
                  <li key={version.id} style={styles.listItem}>
                    <span>{version.label || "Master export"}</span>
                    <span style={styles.badge(version.status === "complete" ? "good" : "info")}>
                      {version.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={styles.empty}>No exports yet.</div>
            )}
          </div>
        </div>
      </section>

      <section style={roomStyles.section}>
        <h2 style={roomStyles.sectionTitle}>Budget snapshot</h2>
        {billingStatus ? (
          <CreditMeter
            credits={billingStatus.creditsBalance}
            plan={billingStatus.plan}
            unlimited={billingStatus.unlimited}
          />
        ) : (
          <div style={styles.empty}>Budget data is loading.</div>
        )}
      </section>
    </RoomLayout>
  );
}
