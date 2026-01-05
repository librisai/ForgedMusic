import { Worker } from "bullmq";
import { connection } from "./queue.js";

// Simulate chunked full-song rendering
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulatePhotoSinger(job) {
  // Example: break into N segments
  const segments = job.data?.segments ?? 12; // later compute based on song length
  const perSegment = 100 / segments;

  for (let i = 0; i < segments; i++) {
    // pretend each segment render takes time
    await sleep(800);

    const progress = Math.min(99, Math.round((i + 1) * perSegment));
    await job.updateProgress(progress);

    // optional: store intermediate artifact pointers later
  }

  // final result
  await job.updateProgress(100);

  return {
    previewVideoUrl: "http://localhost:5000/static/preview.mp4",
    finalVideoUrl: "http://localhost:5000/static/final.mp4",
    mode: job.data.visualMode,
  };
}

const worker = new Worker(
  "video-generation",
  async job => {
    // In production you route to different pipelines by mode
    if (job.data.visualMode === "performance") {
      return simulatePhotoSinger(job);
    }

    // other modes later
    await job.updateProgress(100);
    return { finalVideoUrl: "http://localhost:5000/static/final.mp4", mode: job.data.visualMode };
  },
  { connection }
);

worker.on("completed", job => console.log("completed", job.id));
worker.on("failed", (job, err) => console.error("failed", job?.id, err));
console.log("Worker running...");
