// lib/api/auth/authApi.ts

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse } from '../client';
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  UserDto,
} from './auth.types';

class AuthApiClient {
  async login(data: LoginDto): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
  }

  async register(data: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  }

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  }

  async refresh(data: RefreshTokenDto): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH, data);
  }

  async getProfile(): Promise<ApiResponse<UserDto>> {
    return apiClient.get(ENDPOINTS.AUTH.PROFILE);
  }
}

export const authApiClient = new AuthApiClient();
