export interface UploadJob {
  jobId: string;
  tempFilePath: string;
  storagePath: string;
}

export interface JobResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
  result?: any;
}
