// lib/api/auth/auth.types.ts

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: UserDto;
}

export interface UserDto {
  id: number;
  email: string;
  name: string;
  storageQuota: number;
  storageUsed: number;
}

export interface RefreshTokenDto {
  refresh_token: string;
}
