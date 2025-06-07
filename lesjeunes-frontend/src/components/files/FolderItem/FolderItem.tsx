'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder as FolderIcon, MoreVertical } from 'lucide-react';
import { Folder } from '@/domain/files/FileEntities.entity';
import { formatDate } from '@/lib/utils';

interface FolderItemProps {
  folder: Folder;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  selectItem: (id: number) => void;
  navigateToFolder: (id: number) => void;
}

export function FolderItem({
  folder,
  viewMode,
  isSelected,
  selectItem,
  navigateToFolder,
}: FolderItemProps) {
  const handleClick = () => {
    selectItem(folder.id);
  };

  const handleDoubleClick = () => {
    navigateToFolder(folder.id);
  };

  if (viewMode === 'grid') {
    return (
      <Card
        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary bg-accent' : ''
        }`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex flex-col items-center space-y-3">
          <FolderIcon className="h-12 w-12 text-blue-500" />
          <div className="text-center w-full">
            <p
              className="font-medium text-sm truncate w-full"
              title={folder.name}
            >
              {folder.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(folder.modifiedAt)}
            </p>
            {folder.fileCount !== undefined && (
              <p className="text-xs text-muted-foreground">
                {folder.fileCount} items
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div
      className={`flex items-center p-3 hover:bg-accent cursor-pointer transition-colors ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center space-x-3 flex-1">
        <FolderIcon className="h-8 w-8 text-blue-500" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{folder.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(folder.modifiedAt)}
          </p>
        </div>
        <div className="text-sm text-muted-foreground w-24">
          {folder.fileCount !== undefined ? `${folder.fileCount} items` : '-'}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
