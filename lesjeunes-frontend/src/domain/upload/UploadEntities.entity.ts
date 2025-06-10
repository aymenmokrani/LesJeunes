// domain/upload/entities/UploadEntities.entity.ts

export interface UploadedFile {
  id: number;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt?: string;
  folderId?: number;

  // UI-specific properties
  isUploading?: boolean;
  uploadProgress?: number;
  uploadError?: string;
  thumbnailUrl?: string;
}

export interface UploadProgress {
  uploadId: string;
  fileName: string;
  totalSize: number;
  uploadedSize: number;
  progress: number; // Percentage (0-100)
  status: 'pending' | 'uploading' | 'complete' | 'error' | 'cancelled';
  isComplete: boolean;
  error?: string;

  // UI-specific properties
  startedAt?: string;
  completedAt?: string;
}
