// lib/api/upload/upload.types.ts

export interface UploadResponse {
  id: number;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

export interface UploadProgressResponse {
  uploadId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
}
