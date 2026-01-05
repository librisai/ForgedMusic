const API_BASE = "http://localhost:5000/api";

export async function uploadMedia({ audioFile, imageFile, visualMode }) {
  const form = new FormData();
  form.append("visualMode", visualMode);
  form.append("audio", audioFile);
  if (imageFile) form.append("image", imageFile);

  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }
  return res.json(); // { audioRef, performanceImageRef }
}

export async function startGeneration(payload) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { jobId }
}

export function subscribeToJob(jobId, handlers) {
  const es = new EventSource(`${API_BASE}/jobs/${jobId}/events`);
  es.addEventListener("status", event => handlers?.onStatus?.(JSON.parse(event.data)));
  es.addEventListener("progress", event => handlers?.onProgress?.(JSON.parse(event.data)));
  es.addEventListener("completed", event => handlers?.onCompleted?.(JSON.parse(event.data)));
  es.addEventListener("failed", event => handlers?.onFailed?.(JSON.parse(event.data)));
  es.onerror = () => handlers?.onError?.();
  return () => es.close();
}
