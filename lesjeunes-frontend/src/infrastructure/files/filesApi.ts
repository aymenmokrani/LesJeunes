// lib/api/files/filesApi.ts
// Files API client - handles HTTP communication only

import { apiClient } from '../api/client';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import {
  FileDto,
  FileListParams,
  FileListResponse,
  FolderDto,
  FolderListParams,
  SearchParams,
} from './dto';

class FilesApiClient {
  // File operations
  async getFiles(params?: FileListParams): Promise<FileDto[]> {
    return apiClient.get<FileDto[]>(ENDPOINTS.FILES.LIST, { params });
  }

  async getFileById(id: number): Promise<FileDto> {
    return apiClient.get<FileDto>(ENDPOINTS.FILES.GET_BY_ID(id));
  }

  async updateFile(id: number, data: Partial<FileDto>): Promise<FileDto> {
    return apiClient.put<FileDto>(ENDPOINTS.FILES.UPDATE(id), data);
  }

  async deleteFile(id: number): Promise<void> {
    return apiClient.delete(ENDPOINTS.FILES.DELETE(id));
  }

  async moveFile(id: number, data: { folderId?: number }): Promise<FileDto> {
    return apiClient.post<FileDto>(ENDPOINTS.FILES.MOVE(id), data);
  }

  async downloadFile(id: number): Promise<void> {
    return apiClient.download(ENDPOINTS.FILES.DOWNLOAD(id));
  }

  // Folder operations
  async createFolder(data: {
    name: string;
    parentId?: number;
  }): Promise<FolderDto> {
    return apiClient.post<FolderDto>(ENDPOINTS.FILES.CREATE_FOLDER, data);
  }

  async getFolders(params?: FolderListParams): Promise<FolderDto[]> {
    return apiClient.get<FolderDto[]>(ENDPOINTS.FILES.GET_FOLDERS, { params });
  }

  async getFolderById(id: number): Promise<FolderDto> {
    return apiClient.get<FolderDto>(ENDPOINTS.FILES.GET_FOLDER(id));
  }

  async updateFolder(id: number, data: { name: string }): Promise<FolderDto> {
    return apiClient.put<FolderDto>(ENDPOINTS.FILES.UPDATE_FOLDER(id), data);
  }

  async deleteFolder(id: number): Promise<void> {
    return apiClient.delete(ENDPOINTS.FILES.DELETE_FOLDER(id));
  }

  // Search
  async searchFiles(params: SearchParams): Promise<FileListResponse> {
    return apiClient.get<FileListResponse>(ENDPOINTS.FILES.SEARCH, { params });
  }
}

export const filesApiClient = new FilesApiClient();
