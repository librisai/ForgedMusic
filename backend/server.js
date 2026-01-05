import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { videoQueue, connection } from "./queue.js";
import { QueueEvents } from "bullmq";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/static", express.static(path.join(__dirname, "static")));

const queueEvents = new QueueEvents("video-generation", { connection });

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.fields([{ name: "audio" }, { name: "image" }]), async (req, res) => {
  const audio = req.files?.audio?.[0];
  const image = req.files?.image?.[0];

  if (!audio) return res.status(400).json({ error: "Missing audio file" });

  // For performance mode, image is required
  const visualMode = req.body?.visualMode || "visualizer";
  if (visualMode === "performance" && !image) {
    return res.status(400).json({ error: "Missing image file for performance mode" });
  }

  const audioRef = `${req.protocol}://${req.get("host")}/uploads/${audio.filename}`;
  const imageRef = image ? `${req.protocol}://${req.get("host")}/uploads/${image.filename}` : null;

  res.json({ audioRef, performanceImageRef: imageRef });
});

/**
 * POST /api/generate
 * Creates a generation job (audio+image references for now).
 * Later you'll upload to S3 and pass signed URLs.
 */
app.post("/api/generate", async (req, res) => {
  const payload = req.body;

  // Basic validation (expand later)
  if (!payload?.visualMode) return res.status(400).json({ error: "Missing visualMode" });
  if (!payload?.audioRef) return res.status(400).json({ error: "Missing audioRef" });

  if (payload.visualMode === "performance" && !payload.performanceImageRef) {
    return res.status(400).json({ error: "Missing performanceImageRef" });
  }

  const job = await videoQueue.add("generateVideo", payload, {
    removeOnComplete: true,
    removeOnFail: false,
  });

  res.json({ jobId: job.id });
});

/**
 * GET /api/jobs/:id
 * Returns current status/progress and any result URLs.
 */
app.get("/api/jobs/:id", async (req, res) => {
  const job = await videoQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const state = await job.getState();
  res.json({
    jobId: job.id,
    status: state, // waiting | active | completed | failed | delayed
    progress: job.progress || 0,
    data: job.data,
    result: job.returnvalue || null,
    failedReason: job.failedReason || null,
  });
});

/**
 * POST /api/jobs/:id/cancel
 */
app.post("/api/jobs/:id/cancel", async (req, res) => {
  const job = await videoQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const state = await job.getState();
  if (state === "completed" || state === "failed") {
    return res.status(409).json({ error: `Cannot cancel job in state: ${state}` });
  }

  await job.remove();
  res.json({ ok: true });
});

/**
 * GET /api/jobs/:id/events  (SSE)
 * Streams progress updates to the frontend in real-time.
 */
app.get("/api/jobs/:id/events", async (req, res) => {
  const jobId = req.params.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send an initial snapshot if job exists
  const job = await videoQueue.getJob(jobId);
  if (!job) {
    send("failed", { jobId, error: "Job not found" });
    return res.end();
  }

  send("status", { jobId, status: await job.getState(), progress: job.progress || 0 });

  // BullMQ QueueEvents gives us global events; filter by jobId
  const onProgress = ({ jobId: evJobId, data }) => {
    if (String(evJobId) !== String(jobId)) return;
    send("progress", { jobId, progress: data });
  };

  const onCompleted = ({ jobId: evJobId, returnvalue }) => {
    if (String(evJobId) !== String(jobId)) return;
    send("completed", { jobId, result: returnvalue });
    cleanup();
  };

  const onFailed = ({ jobId: evJobId, failedReason }) => {
    if (String(evJobId) !== String(jobId)) return;
    send("failed", { jobId, error: failedReason });
    cleanup();
  };

  queueEvents.on("progress", onProgress);
  queueEvents.on("completed", onCompleted);
  queueEvents.on("failed", onFailed);

  const heartbeat = setInterval(() => send("ping", { t: Date.now() }), 15000);

  const cleanup = () => {
    clearInterval(heartbeat);
    queueEvents.off("progress", onProgress);
    queueEvents.off("completed", onCompleted);
    queueEvents.off("failed", onFailed);
    res.end();
  };

  req.on("close", cleanup);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
