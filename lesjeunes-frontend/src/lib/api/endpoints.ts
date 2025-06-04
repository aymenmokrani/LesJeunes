// lib/api/endpoints.ts

// Base endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/me',
  },

  // Files endpoints
  FILES: {
    // File operations
    LIST: '/files', // GET /files
    GET_BY_ID: (id: number) => `/files/${id}`, // GET /files/:id
    DOWNLOAD: (id: number) => `/files/${id}/download`, // GET /files/:id/download
    UPDATE: (id: number) => `/files/${id}`, // PUT /files/:id
    DELETE: (id: number) => `/files/${id}`, // DELETE /files/:id
    MOVE: (id: number) => `/files/${id}/move`, // POST /files/:id/move

    // Folder operations
    CREATE_FOLDER: '/files/folders', // POST /files/folders
    GET_FOLDERS: '/files/folders', // GET /files/folders
    GET_FOLDER: (id: number) => `/files/folders/${id}`, // GET /files/folders/:id
    UPDATE_FOLDER: (id: number) => `/files/folders/${id}`, // PUT /files/folders/:id
    DELETE_FOLDER: (id: number) => `/files/folders/${id}`, // DELETE /files/folders/:id

    // Search
    SEARCH: '/files/search', // GET /files/search
  },

  // Upload endpoints
  UPLOAD: {
    // Basic uploads
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple',

    // Specialized uploads
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    AVATAR: '/upload/avatar',

    // File replacement
    REPLACE: (id: number) => `/upload/replace/${id}`,

    // Progress tracking
    PROGRESS: (uploadId: string) => `/upload/progress/${uploadId}`,

    // Chunked upload for large files
    CHUNKED: (uploadId: string) => `/upload/chunked/${uploadId}`,

    // Future endpoints (not implemented yet)
    BULK_ZIP: '/upload/bulk-zip',
    FROM_URL: '/upload/from-url',
  },

  // Users endpoints
  USERS: {
    CREATE: '/users', // POST /users
    LIST: '/users', // GET /users
    GET_BY_ID: (id: number) => `/users/${id}`, // GET /users/:id
    UPDATE: (id: number) => `/users/${id}`, // PATCH /users/:id
    DELETE: (id: number) => `/users/${id}`, // DELETE /users/:id
  },
} as const;
