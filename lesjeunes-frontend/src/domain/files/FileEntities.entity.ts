// domain/files/entities/FileEntities.entity.ts

export interface File {
  id: number;
  name: string;
  type: 'file';
  size: number;
  mimeType: string;
  modifiedAt: string;
  createdAt: string;
  parentId?: number;

  // UI-specific properties for file manager
  isSelected?: boolean;
  isLoading?: boolean;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

export interface Folder {
  id: number;
  name: string;
  type: 'folder';
  modifiedAt: string;
  createdAt: string;
  parentId?: number;

  // UI-specific properties for file manager
  isSelected?: boolean;
  isLoading?: boolean;
  isExpanded?: boolean;

  // Folder-specific properties
  fileCount?: number;
  folderCount?: number;
  totalSize?: number;
}

// Union type for file manager components
export type FileItem = File | Folder;

// Helper type for breadcrumb navigation
export interface BreadcrumbItem {
  id: number;
  name: string;
  path: string;
}
