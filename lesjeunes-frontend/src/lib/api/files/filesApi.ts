// lib/api/files/filesApi.ts
// Files API client - handles HTTP communication only

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse } from '../client';
import {
  FileDto,
  FileListParams,
  FileListResponse,
  FolderDto,
  FolderListParams,
  SearchParams,
} from './files.types';

class FilesApiClient {
  // File operations
  async getFiles(
    params?: FileListParams
  ): Promise<ApiResponse<FileListResponse>> {
    return apiClient.get(ENDPOINTS.FILES.LIST, { params });
  }

  async getFileById(id: number): Promise<ApiResponse<FileDto>> {
    return apiClient.get(ENDPOINTS.FILES.GET_BY_ID(id));
  }

  async updateFile(
    id: number,
    data: Partial<FileDto>
  ): Promise<ApiResponse<FileDto>> {
    return apiClient.put(ENDPOINTS.FILES.UPDATE(id), data);
  }

  async deleteFile(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(ENDPOINTS.FILES.DELETE(id));
  }

  async moveFile(
    id: number,
    data: { folderId?: number }
  ): Promise<ApiResponse<FileDto>> {
    return apiClient.post(ENDPOINTS.FILES.MOVE(id), data);
  }

  async downloadFile(id: number): Promise<void> {
    return apiClient.download(ENDPOINTS.FILES.DOWNLOAD(id));
  }

  // Folder operations
  async createFolder(data: {
    name: string;
    parentId?: number;
  }): Promise<ApiResponse<FolderDto>> {
    return apiClient.post(ENDPOINTS.FILES.CREATE_FOLDER, data);
  }

  async getFolders(
    params?: FolderListParams
  ): Promise<ApiResponse<FolderDto[]>> {
    return apiClient.get(ENDPOINTS.FILES.GET_FOLDERS, { params });
  }

  async getFolderById(id: number): Promise<ApiResponse<FolderDto>> {
    return apiClient.get(ENDPOINTS.FILES.GET_FOLDER(id));
  }

  async updateFolder(
    id: number,
    data: { name: string }
  ): Promise<ApiResponse<FolderDto>> {
    return apiClient.put(ENDPOINTS.FILES.UPDATE_FOLDER(id), data);
  }

  async deleteFolder(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(ENDPOINTS.FILES.DELETE_FOLDER(id));
  }

  // Search
  async searchFiles(
    params: SearchParams
  ): Promise<ApiResponse<FileListResponse>> {
    return apiClient.get(ENDPOINTS.FILES.SEARCH, { params });
  }
}

export const filesApiClient = new FilesApiClient();
