export enum AudioInputType {
  Upload = "upload",
  Url = "url",
}

export enum AspectRatio {
  SixteenNine = "16:9",
  NineSixteen = "9:16",
  OneOne = "1:1",
}

export enum DurationMode {
  FullSong = "fullSong",
  Clip = "clip",
}

export enum StoryMode {
  Visualizer = "visualizer",
  Narrative = "narrative",
}

export enum DetailLevel {
  Preview = "preview",
  Final = "final",
}

export enum JobStatus {
  Queued = "queued",
  Running = "running",
  Completed = "completed",
  Failed = "failed",
  Canceled = "canceled",
}

export enum JobEventType {
  Status = "status",
  Progress = "progress",
  Completed = "completed",
  Failed = "failed",
  Canceled = "canceled",
}

export interface UploadAudioInput {
  type: AudioInputType.Upload;
  uploadId: string;
}

export interface UrlAudioInput {
  type: AudioInputType.Url;
  url: string;
}

export type AudioInput = UploadAudioInput | UrlAudioInput;

export interface GenerateRequestBase {
  audio: AudioInput;
  lyrics?: string | null;
  stylePreset: string;
  aspectRatio: AspectRatio;
  storyMode: StoryMode;
  intensity: number;
  motion: number;
  detailLevel: DetailLevel;
  seed?: number;
}

export interface GenerateRequestFull extends GenerateRequestBase {
  durationMode: DurationMode.FullSong;
  clipStartSeconds?: never;
  clipLengthSeconds?: never;
}

export interface GenerateRequestClip extends GenerateRequestBase {
  durationMode: DurationMode.Clip;
  clipStartSeconds: number;
  clipLengthSeconds: number;
}

export type GenerateRequest = GenerateRequestFull | GenerateRequestClip;

export interface JobError {
  code: string;
  message: string;
}

export interface GenerateResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
  etaSeconds?: number | null;
  previewVideoUrl?: string | null;
  finalVideoUrl?: string | null;
  error?: JobError | null;
}

export interface JobEvent extends JobStatusResponse {
  type: JobEventType;
}
