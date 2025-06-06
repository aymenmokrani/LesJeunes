// lib/api/upload/upload.dto.ts

export interface UploadResponse {
  id: number;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  folder: string;
  visibility: string;
}

export interface UploadProgressResponse {
  uploadId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
}
