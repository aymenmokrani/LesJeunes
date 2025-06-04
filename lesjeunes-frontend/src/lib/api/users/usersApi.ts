// lib/api/users/usersApi.ts

import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import type { ApiResponse } from '../client';
import type { CreateUserDto, UpdateUserDto, UserDto } from './users.types';

class UsersApiClient {
  async create(data: CreateUserDto): Promise<ApiResponse<UserDto>> {
    return apiClient.post(ENDPOINTS.USERS.CREATE, data);
  }

  async getAll(): Promise<ApiResponse<UserDto[]>> {
    return apiClient.get(ENDPOINTS.USERS.LIST);
  }

  async getById(id: number): Promise<ApiResponse<UserDto>> {
    return apiClient.get(ENDPOINTS.USERS.GET_BY_ID(id));
  }

  async update(id: number, data: UpdateUserDto): Promise<ApiResponse<UserDto>> {
    return apiClient.patch(ENDPOINTS.USERS.UPDATE(id), data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(ENDPOINTS.USERS.DELETE(id));
  }
}

export const usersApiClient = new UsersApiClient();
