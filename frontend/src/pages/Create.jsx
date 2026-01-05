import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectState } from "../state/ProjectContext";

const ui = {
  page: {
    maxWidth: 980,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 16,
    alignItems: "start",
  },
  card: {
    background: "#141416",
    border: "1px solid #1f1f22",
    borderRadius: 14,
    padding: 16,
  },
  title: { fontSize: 22, fontWeight: 650, margin: "0 0 6px" },
  sub: { color: "#a7a7ad", margin: "0 0 16px", lineHeight: 1.4 },

  row: { display: "grid", gap: 10, marginBottom: 14 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  label: { display: "block", fontSize: 13, color: "#c7c7cc", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2b2b30",
    background: "#0f0f10",
    color: "#fff",
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: 160,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2b2b30",
    background: "#0f0f10",
    color: "#fff",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.4,
  },
  hint: { fontSize: 12, color: "#8f8f96", marginTop: 6 },

  drop: {
    borderRadius: 14,
    border: "1px dashed #2b2b30",
    background: "#0f0f10",
    padding: 18,
    display: "grid",
    gap: 10,
  },
  dropActive: {
    borderColor: "rgba(59,130,246,0.8)",
    boxShadow: "0 0 0 2px rgba(59,130,246,0.25)",
  },
  dropTitle: { fontSize: 14, fontWeight: 600, margin: 0 },
  dropText: { color: "#a7a7ad", margin: 0, lineHeight: 1.4 },

  fileMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2b2b30",
    background: "#111113",
  },
  pill: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    background: "#1f1f22",
    color: "#c7c7cc",
  },
  danger: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.08)",
    color: "#ffd2d2",
    fontSize: 13,
  },

  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  button: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #2b2b30",
    background: "#1a1a1d",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  primary: {
    background: "#3b82f6",
    borderColor: "#3b82f6",
  },
  disabled: { opacity: 0.55, cursor: "not-allowed" },

  sectionTitle: { fontSize: 14, fontWeight: 650, margin: "0 0 10px" },
  radioRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  radioPill: isOn => ({
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #2b2b30",
    background: isOn ? "#1a1a1d" : "#0f0f10",
    color: isOn ? "#fff" : "#c7c7cc",
    cursor: "pointer",
    userSelect: "none",
  }),
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    border: "1px solid #2b2b30",
    background: "#0b0b0c",
    overflow: "hidden",
    flexShrink: 0,
  },
};

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

function isImageAllowed(file) {
  if (!file) return false;
  const typeOk = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  const nameOk = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
  return typeOk || nameOk;
}

export default function Create() {
  const navigate = useNavigate();

  const audioInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const { project, setProjectField, markStepComplete } = useProjectState();

  const [audioFile, setAudioFile] = useState(project?.audioFile || null);
  const [title, setTitle] = useState(project?.title || "");
  const [artist, setArtist] = useState(project?.artist || "");
  const [lyrics, setLyrics] = useState(project?.lyrics || "");

  const [durationMode, setDurationMode] = useState(project?.durationMode || "full");
  const [clipLength, setClipLength] = useState(project?.clipLength || 30);

  const [visualMode, setVisualMode] = useState(project?.visualMode || "visualizer");
  const [performanceMode, setPerformanceMode] = useState(project?.performanceMode || "auto");
  const [performanceImageFile, setPerformanceImageFile] = useState(
    project?.performanceImageFile || null
  );

  const [audioDragOver, setAudioDragOver] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);

  const [error, setError] = useState("");

  const imagePreviewUrl = useMemo(() => {
    if (!performanceImageFile) return "";
    return URL.createObjectURL(performanceImageFile);
  }, [performanceImageFile]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const hasValidAudio = useMemo(() => audioFile && isAudioAllowed(audioFile), [audioFile]);
  const hasValidImage = useMemo(
    () => performanceImageFile && isImageAllowed(performanceImageFile),
    [performanceImageFile]
  );

  const isReady = useMemo(() => {
    if (!hasValidAudio) return false;
    if (visualMode === "performance" && !hasValidImage) return false;
    return true;
  }, [hasValidAudio, visualMode, hasValidImage]);

  useEffect(() => {
    if (typeof setProjectField === "function") {
      setProjectField("audioFile", audioFile);
      setProjectField("title", title);
      setProjectField("artist", artist);
      setProjectField("lyrics", lyrics);
      setProjectField("durationMode", durationMode);
      setProjectField("clipLength", clipLength);

      setProjectField("visualMode", visualMode);
      setProjectField("performanceMode", performanceMode);
      setProjectField("performanceImageFile", performanceImageFile);
    }
    if (typeof markStepComplete === "function") {
      markStepComplete("create", isReady);
    }
  }, [
    audioFile,
    title,
    artist,
    lyrics,
    durationMode,
    clipLength,
    visualMode,
    performanceMode,
    performanceImageFile,
    isReady,
    setProjectField,
    markStepComplete,
  ]);

  function pickAudio() {
    setError("");
    audioInputRef.current?.click();
  }

  function pickImage() {
    setError("");
    imageInputRef.current?.click();
  }

  function handleAudio(file) {
    setError("");
    if (!file) return;
    if (!isAudioAllowed(file)) {
      setAudioFile(null);
      setError("Please upload an MP3 or WAV file.");
      return;
    }
    setAudioFile(file);
  }

  function handleImage(file) {
    setError("");
    if (!file) return;
    if (!isImageAllowed(file)) {
      setPerformanceImageFile(null);
      setError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    setPerformanceImageFile(file);
  }

  function goNext() {
    if (!isReady) return;
    navigate("/style");
  }

  return (
    <div style={ui.page}>
      <section style={ui.card} aria-label="Create project">
        <h1 style={ui.title}>Create</h1>
        <p style={ui.sub}>
          Upload your audio, choose how the visuals should work, and add optional lyrics. Next you'll pick the
          style.
        </p>

        <div style={ui.row}>
          <div style={ui.sectionTitle}>Visual mode</div>
          <div style={ui.radioRow} role="radiogroup" aria-label="Visual mode">
            <div
              style={ui.radioPill(visualMode === "visualizer")}
              role="radio"
              aria-checked={visualMode === "visualizer"}
              tabIndex={0}
              onClick={() => setVisualMode("visualizer")}
              onKeyDown={event =>
                (event.key === "Enter" || event.key === " ") && setVisualMode("visualizer")
              }
            >
              Visualizer
            </div>
            <div
              style={ui.radioPill(visualMode === "narrative")}
              role="radio"
              aria-checked={visualMode === "narrative"}
              tabIndex={0}
              onClick={() => setVisualMode("narrative")}
              onKeyDown={event =>
                (event.key === "Enter" || event.key === " ") && setVisualMode("narrative")
              }
            >
              Narrative
            </div>
            <div
              style={ui.radioPill(visualMode === "performance")}
              role="radio"
              aria-checked={visualMode === "performance"}
              tabIndex={0}
              onClick={() => setVisualMode("performance")}
              onKeyDown={event =>
                (event.key === "Enter" || event.key === " ") && setVisualMode("performance")
              }
            >
              Singing Performance
            </div>
          </div>
          <div style={ui.hint}>
            Singing Performance makes a photo (or character image) perform the full song. We render in segments to
            keep it stable.
          </div>
        </div>

        <div style={ui.row}>
          <label style={ui.label}>Audio file</label>

          <div
            style={{ ...ui.drop, ...(audioDragOver ? ui.dropActive : {}) }}
            onDragOver={event => {
              event.preventDefault();
              setAudioDragOver(true);
            }}
            onDragLeave={() => setAudioDragOver(false)}
            onDrop={event => {
              event.preventDefault();
              setAudioDragOver(false);
              handleAudio(event.dataTransfer.files?.[0]);
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload audio file (MP3 or WAV). Click to browse or drag and drop."
            onKeyDown={event => (event.key === "Enter" || event.key === " ") && pickAudio()}
            onClick={pickAudio}
          >
            <p style={ui.dropTitle}>Drop an MP3/WAV here, or click to browse</p>
            <p style={ui.dropText}>We'll detect tempo, sections, and emotion to drive the video.</p>

            <input
              ref={audioInputRef}
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              onChange={event => handleAudio(event.target.files?.[0])}
              style={{ display: "none" }}
            />

            {audioFile ? (
              <div style={ui.fileMeta} aria-live="polite">
                <div style={{ display: "grid", gap: 2 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{audioFile.name}</div>
                  <div style={{ color: "#9a9aa1", fontSize: 12 }}>{formatBytes(audioFile.size)}</div>
                </div>
                <span style={ui.pill}>{audioFile.type || "audio"}</span>
              </div>
            ) : (
              <div style={ui.hint}>Accepted: .mp3, .wav</div>
            )}
          </div>
        </div>

        <div style={ui.twoCol}>
          <div style={ui.row}>
            <label style={ui.label} htmlFor="songTitle">
              Song title (optional)
            </label>
            <input
              id="songTitle"
              style={ui.input}
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="e.g., Neon Rain"
              autoComplete="off"
            />
          </div>

          <div style={ui.row}>
            <label style={ui.label} htmlFor="artistName">
              Artist (optional)
            </label>
            <input
              id="artistName"
              style={ui.input}
              value={artist}
              onChange={event => setArtist(event.target.value)}
              placeholder="e.g., Shawna"
              autoComplete="off"
            />
          </div>
        </div>

        <div style={ui.row}>
          <label style={ui.label} htmlFor="lyrics">
            Lyrics (optional)
          </label>
          <textarea
            id="lyrics"
            style={ui.textarea}
            value={lyrics}
            onChange={event => setLyrics(event.target.value)}
            placeholder="Paste lyrics here (optional). Lyrics improve narrative + performance timing."
          />
          <div style={ui.hint}>
            Later: we can auto-transcribe and timestamp lyrics for perfect scene + mouth timing.
          </div>
        </div>

        {visualMode === "performance" ? (
          <div style={ui.row}>
            <label style={ui.label}>Performance image</label>

            <div style={ui.twoCol}>
              <div
                style={{ ...ui.drop, ...(imageDragOver ? ui.dropActive : {}) }}
                onDragOver={event => {
                  event.preventDefault();
                  setImageDragOver(true);
                }}
                onDragLeave={() => setImageDragOver(false)}
                onDrop={event => {
                  event.preventDefault();
                  setImageDragOver(false);
                  handleImage(event.dataTransfer.files?.[0]);
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload a face or character image (JPG, PNG, WEBP). Click to browse or drag and drop."
                onKeyDown={event => (event.key === "Enter" || event.key === " ") && pickImage()}
                onClick={pickImage}
              >
                <p style={ui.dropTitle}>Drop an image here, or click to browse</p>
                <p style={ui.dropText}>Works with real photos or characters. Best: front-facing, clear face.</p>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={event => handleImage(event.target.files?.[0])}
                  style={{ display: "none" }}
                />

                {performanceImageFile ? (
                  <div style={ui.fileMeta} aria-live="polite">
                    <div style={{ display: "grid", gap: 2 }}>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
                        {performanceImageFile.name}
                      </div>
                      <div style={{ color: "#9a9aa1", fontSize: 12 }}>
                        {formatBytes(performanceImageFile.size)}
                      </div>
                    </div>
                    <span style={ui.pill}>{performanceImageFile.type || "image"}</span>
                  </div>
                ) : (
                  <div style={ui.hint}>Accepted: .jpg, .png, .webp</div>
                )}
              </div>

              <div style={{ ...ui.card, padding: 12 }}>
                <div style={ui.sectionTitle}>Preview</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={ui.thumb}>
                    {performanceImageFile ? (
                      <img
                        src={imagePreviewUrl}
                        alt="Performance subject preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={ui.sectionTitle}>Performance mode</div>
                    <div style={ui.radioRow} role="radiogroup" aria-label="Performance mode">
                      <div
                        style={ui.radioPill(performanceMode === "auto")}
                        role="radio"
                        aria-checked={performanceMode === "auto"}
                        tabIndex={0}
                        onClick={() => setPerformanceMode("auto")}
                        onKeyDown={event =>
                          (event.key === "Enter" || event.key === " ") && setPerformanceMode("auto")
                        }
                      >
                        Auto
                      </div>
                      <div
                        style={ui.radioPill(performanceMode === "photoreal")}
                        role="radio"
                        aria-checked={performanceMode === "photoreal"}
                        tabIndex={0}
                        onClick={() => setPerformanceMode("photoreal")}
                        onKeyDown={event =>
                          (event.key === "Enter" || event.key === " ") && setPerformanceMode("photoreal")
                        }
                      >
                        Photoreal
                      </div>
                      <div
                        style={ui.radioPill(performanceMode === "stylized")}
                        role="radio"
                        aria-checked={performanceMode === "stylized"}
                        tabIndex={0}
                        onClick={() => setPerformanceMode("stylized")}
                        onKeyDown={event =>
                          (event.key === "Enter" || event.key === " ") && setPerformanceMode("stylized")
                        }
                      >
                        Stylized
                      </div>
                    </div>
                    <div style={ui.hint}>
                      Auto picks the best model. Stylized is safest for anime/mascots.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={ui.hint}>
              Consent reminder: only upload images you own or have permission to use.
            </div>
          </div>
        ) : null}

        {error ? <div style={ui.danger}>{error}</div> : null}

        <div style={ui.actions}>
          <button
            type="button"
            style={{ ...ui.button, ...ui.primary, ...(isReady ? {} : ui.disabled) }}
            disabled={!isReady}
            onClick={goNext}
          >
            Next: Style
          </button>
        </div>
      </section>

      <aside style={ui.card} aria-label="Project settings">
        <h2 style={ui.sectionTitle}>Clip settings</h2>

        <div style={ui.row}>
          <div style={ui.radioRow} role="radiogroup" aria-label="Duration mode">
            <div
              style={ui.radioPill(durationMode === "full")}
              role="radio"
              aria-checked={durationMode === "full"}
              tabIndex={0}
              onClick={() => setDurationMode("full")}
              onKeyDown={event =>
                (event.key === "Enter" || event.key === " ") && setDurationMode("full")
              }
            >
              Full song
            </div>
            <div
              style={ui.radioPill(durationMode === "clip")}
              role="radio"
              aria-checked={durationMode === "clip"}
              tabIndex={0}
              onClick={() => setDurationMode("clip")}
              onKeyDown={event =>
                (event.key === "Enter" || event.key === " ") && setDurationMode("clip")
              }
            >
              Clip
            </div>
          </div>

          {durationMode === "clip" ? (
            <div style={ui.row}>
              <label style={ui.label} htmlFor="clipLength">
                Clip length (seconds)
              </label>
              <input
                id="clipLength"
                type="number"
                min={5}
                max={180}
                value={clipLength}
                onChange={event => setClipLength(Number(event.target.value || 0))}
                style={ui.input}
              />
              <div style={ui.hint}>Recommended: 15-60 seconds for fastest iteration.</div>
            </div>
          ) : (
            <div style={ui.hint}>Full-song generation will take longer. Clips are ideal for previews.</div>
          )}
        </div>

        <hr style={{ border: 0, borderTop: "1px solid #1f1f22", margin: "14px 0" }} />

        <h2 style={ui.sectionTitle}>Readiness</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={ui.fileMeta}>
            <span style={{ color: "#c7c7cc" }}>Audio uploaded</span>
            <span style={ui.pill}>{hasValidAudio ? "Yes" : "No"}</span>
          </div>

          <div style={ui.fileMeta}>
            <span style={{ color: "#c7c7cc" }}>Mode</span>
            <span style={ui.pill}>
              {visualMode === "performance"
                ? "Singing Performance"
                : visualMode === "narrative"
                ? "Narrative"
                : "Visualizer"}
            </span>
          </div>

          {visualMode === "performance" ? (
            <div style={ui.fileMeta}>
              <span style={{ color: "#c7c7cc" }}>Image uploaded</span>
              <span style={ui.pill}>{hasValidImage ? "Yes" : "No"}</span>
            </div>
          ) : null}

          <div style={ui.fileMeta}>
            <span style={{ color: "#c7c7cc" }}>Lyrics added</span>
            <span style={ui.pill}>{lyrics?.trim() ? "Yes" : "No"}</span>
          </div>

          <div style={ui.hint}>
            You can proceed with just audio. Performance mode requires an image.
          </div>
        </div>
      </aside>
    </div>
  );
}
