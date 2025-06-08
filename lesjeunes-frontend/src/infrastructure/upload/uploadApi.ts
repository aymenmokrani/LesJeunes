// lib/api/upload/uploadApi.ts

import { apiClient } from '../api/client';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import type { UploadResponse, UploadProgressResponse } from './dto';

class UploadApiClient {
  async single(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    return apiClient.upload(ENDPOINTS.UPLOAD.SINGLE, formData, onProgress);
  }

  async multiple(formData: FormData): Promise<UploadResponse[]> {
    return apiClient.upload(ENDPOINTS.UPLOAD.MULTIPLE, formData);
  }

  async image(formData: FormData): Promise<UploadResponse> {
    return apiClient.upload(ENDPOINTS.UPLOAD.IMAGE, formData);
  }

  async document(formData: FormData): Promise<UploadResponse> {
    return apiClient.upload(ENDPOINTS.UPLOAD.DOCUMENT, formData);
  }

  async avatar(formData: FormData): Promise<UploadResponse> {
    return apiClient.upload(ENDPOINTS.UPLOAD.AVATAR, formData);
  }

  async replace(id: number, formData: FormData): Promise<UploadResponse> {
    return apiClient.upload(ENDPOINTS.UPLOAD.REPLACE(id), formData);
  }

  async getProgress(uploadId: string): Promise<UploadProgressResponse> {
    return apiClient.get(ENDPOINTS.UPLOAD.PROGRESS(uploadId));
  }

  async uploadChunk(
    uploadId: string,
    formData: FormData
  ): Promise<UploadProgressResponse> {
    return apiClient.upload(ENDPOINTS.UPLOAD.CHUNKED(uploadId), formData);
  }
}

export const uploadApiClient = new UploadApiClient();
