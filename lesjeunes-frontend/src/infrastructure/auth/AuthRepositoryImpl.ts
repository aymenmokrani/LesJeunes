import { IAuthRepository } from '@/domain/auth/IAuthRepository';
import { Session } from '@/domain/auth/Session.entity';
import { authApiClient } from './authApi';

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<Session> {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const data = await authApiClient.login(email, password);

    // Transform API response to Session entity
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      storageQuota: data.storageQuota,
      storageUsed: data.storageUsed,
    } as Session;
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<Session> {
    // Input validation
    if (!name || email || !password) {
      throw new Error('Missing required fields: name, email, and password');
    }

    const data = await authApiClient.register(name, email, password);

    // Transform API response to Session entity
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      storageQuota: data.storageQuota,
      storageUsed: data.storageUsed,
    } as Session;
  }

  async logout(): Promise<void> {
    return await authApiClient.logout();
  }

  async getCurrentUser(): Promise<Session> {
    const data = await authApiClient.getCurrentUser();

    // Transform API response to Session entity
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      storageQuota: data.storageQuota,
      storageUsed: data.storageUsed,
    } as Session;
  }
}
