'use client';

import { File, Folder } from '@/domain/files/FileEntities.entity';
import { FileItem } from '../FileItem/FileItem';
import { FolderItem } from '../FolderItem/FolderItem';

interface FileManagerGridProps {
  files: File[];
  folders: Folder[];
  viewMode: 'grid' | 'list';
  selectedItems: number[];
  selectItem: (id: number) => void;
  navigateToFolder: (id: number) => void;
}

export function FileManagerGrid({
  files,
  folders,
  viewMode,
  selectedItems,
  selectItem,
  navigateToFolder,
}: FileManagerGridProps) {
  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <div className="text-lg font-medium">This folder is empty</div>
        <div className="text-sm">
          Upload files or create folders to get started
        </div>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {/* Folders first */}
          {folders.map((folder) => (
            <FolderItem
              key={`folder-${folder.id}`}
              folder={folder}
              viewMode="grid"
              isSelected={selectedItems.includes(folder.id)}
              selectItem={selectItem}
              navigateToFolder={navigateToFolder}
            />
          ))}

          {/* Then files */}
          {files.map((file) => (
            <FileItem
              key={`file-${file.id}`}
              file={file}
              viewMode="grid"
              isSelected={selectedItems.includes(file.id)}
              selectItem={selectItem}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-background rounded-lg border">
        {/* List Header */}
        <div className="flex items-center p-3 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
          <div className="flex-1">Name</div>
          <div className="w-32">Modified</div>
          <div className="w-24">Size</div>
          <div className="w-8"></div>
        </div>

        {/* List Items */}
        <div className="divide-y">
          {/* Folders first */}
          {folders.map((folder) => (
            <FolderItem
              key={`folder-${folder.id}`}
              folder={folder}
              viewMode="list"
              isSelected={selectedItems.includes(folder.id)}
              selectItem={selectItem}
              navigateToFolder={navigateToFolder}
            />
          ))}

          {/* Then files */}
          {files.map((file) => (
            <FileItem
              key={`file-${file.id}`}
              file={file}
              viewMode="list"
              isSelected={selectedItems.includes(file.id)}
              selectItem={selectItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
