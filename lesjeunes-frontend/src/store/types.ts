import { Session } from '@/domain/auth/Session.entity';
import { File, Folder } from '@/domain/files/FileEntities.entity';

// Auth types
export interface AuthState {
  user: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Files types
export interface FilesState {
  files: File[];
  folders: Folder[];
  currentFolder: number | null;
  selectedItems: number[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  error: string | null;
  searchResults: File[];
  isSearching: boolean;
}
