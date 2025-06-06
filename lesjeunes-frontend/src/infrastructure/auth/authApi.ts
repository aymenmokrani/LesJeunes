// lib/api/auth/authApi.ts

import { apiClient } from '../api/client';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import { UserResponse } from './dto';

class AuthApiClient {
  async login(email: string, password: string): Promise<UserResponse> {
    return apiClient.post<UserResponse>(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<UserResponse> {
    return apiClient.post<UserResponse>(ENDPOINTS.AUTH.REGISTER, {
      name,
      email,
      password,
    });
  }

  async logout(): Promise<void> {
    return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  }

  async getCurrentUser(): Promise<UserResponse> {
    return apiClient.get<UserResponse>(ENDPOINTS.AUTH.PROFILE);
  }
}

export const authApiClient = new AuthApiClient();
