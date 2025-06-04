// API response types (what comes from the server)
export interface FileDto {
  id: number;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  folderId?: number;
  userId: number;
  visibility: 'private' | 'public';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderDto {
  id: number;
  name: string;
  parentId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileListResponse {
  files: FileDto[];
  folders: FolderDto[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query parameters
export interface FileListParams {
  folderId?: number;
  page?: number;
  limit?: number;
}

export interface FolderListParams {
  parentId?: number;
  page?: number;
  limit?: number;
}

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
}
