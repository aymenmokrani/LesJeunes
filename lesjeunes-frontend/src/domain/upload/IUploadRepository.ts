// domain/upload/repositories/IUploadRepository.ts
import { UploadedFile, UploadProgress } from './UploadEntities.entity';

export interface IUploadRepository {
  // Single and multiple file uploads
  uploadSingle(file: File, folderId?: number): Promise<UploadedFile>;
  uploadMultiple(files: File[], folderId?: number): Promise<UploadedFile[]>;

  // Specialized uploads
  uploadImage(file: File, folderId?: number): Promise<UploadedFile>;
  uploadDocument(file: File, folderId?: number): Promise<UploadedFile>;
  uploadAvatar(file: File): Promise<UploadedFile>;

  // File management
  replaceFile(id: number, file: File): Promise<UploadedFile>;

  // Chunked upload support
  uploadChunk(
    uploadId: string,
    chunk: Blob,
    chunkIndex: number
  ): Promise<UploadProgress>;
  getUploadProgress(uploadId: string): Promise<UploadProgress>;
}
