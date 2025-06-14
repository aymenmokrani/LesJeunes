'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Grid3X3,
  List,
  Upload,
  FolderPlus,
  Settings,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useUpload } from '@/lib/hooks/useUpload';

interface FileManagerHeaderProps {
  viewMode: 'grid' | 'list';
  changeViewMode: (mode: 'grid' | 'list') => void;
  search: (query: string) => Promise<boolean>;
  createFolder: (name: string, parentId?: number) => Promise<boolean>;
}

export function FileManagerHeader({
  viewMode,
  changeViewMode,
  search,
  createFolder,
}: FileManagerHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUploading, uploadSingle } = useUpload();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await search(searchQuery.trim());
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name?.trim()) {
      setIsCreatingFolder(true);
      await createFolder(name.trim());
      setIsCreatingFolder(false);
    }
  };

  // Handle upload
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('run now single upload');

    await uploadSingle(file);
  };
  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-foreground">My Drive</h1>
      </div>

      <div className="flex items-center space-x-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files and folders"
            className="w-80 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateFolder}
          disabled={isCreatingFolder}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <Button variant="outline" size="sm" onClick={triggerUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>

        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
