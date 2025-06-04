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
  access_token: string;
  refresh_token: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}
