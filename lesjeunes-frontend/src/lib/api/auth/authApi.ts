// lib/api/auth/authApi.ts

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  UserDto,
} from './auth.types';

class AuthApiClient {
  async login(data: LoginDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, data);
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  }

  async logout(): Promise<void> {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  }

  async refresh(data: RefreshTokenDto): Promise<AuthResponse> {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH, data);
  }

  async getProfile(): Promise<UserDto> {
    return apiClient.get<UserDto>(ENDPOINTS.AUTH.PROFILE);
  }
}

export const authApiClient = new AuthApiClient();
