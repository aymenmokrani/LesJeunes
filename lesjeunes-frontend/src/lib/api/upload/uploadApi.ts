// lib/api/upload/uploadApi.ts

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse } from '../client';
import type { UploadResponse, UploadProgressResponse } from './upload.types';

class UploadApiClient {
  async single(formData: FormData): Promise<ApiResponse<UploadResponse>> {
    return apiClient.upload(ENDPOINTS.UPLOAD.SINGLE, formData);
  }

  async multiple(formData: FormData): Promise<ApiResponse<UploadResponse[]>> {
    return apiClient.upload(ENDPOINTS.UPLOAD.MULTIPLE, formData);
  }

  async image(formData: FormData): Promise<ApiResponse<UploadResponse>> {
    return apiClient.upload(ENDPOINTS.UPLOAD.IMAGE, formData);
  }

  async document(formData: FormData): Promise<ApiResponse<UploadResponse>> {
    return apiClient.upload(ENDPOINTS.UPLOAD.DOCUMENT, formData);
  }

  async avatar(formData: FormData): Promise<ApiResponse<UploadResponse>> {
    return apiClient.upload(ENDPOINTS.UPLOAD.AVATAR, formData);
  }

  async replace(
    id: number,
    formData: FormData
  ): Promise<ApiResponse<UploadResponse>> {
    return apiClient.upload(ENDPOINTS.UPLOAD.REPLACE(id), formData);
  }

  async getProgress(
    uploadId: string
  ): Promise<ApiResponse<UploadProgressResponse>> {
    return apiClient.get(ENDPOINTS.UPLOAD.PROGRESS(uploadId));
  }

  async uploadChunk(
    uploadId: string,
    formData: FormData
  ): Promise<ApiResponse<UploadProgressResponse>> {
    return apiClient.upload(ENDPOINTS.UPLOAD.CHUNKED(uploadId), formData);
  }
}

export const uploadApiClient = new UploadApiClient();
