import { IAuthRepository } from './IAuthRepository';
import { Session } from './Session.entity';

export class AuthService {
  constructor(private authRepository: IAuthRepository) {}

  async login(email: string, password: string): Promise<Session> {
    try {
      // Business validation
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Please enter both email and password');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      return await this.authRepository.login(email.trim(), password);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        throw new Error('Invalid email or password');
      }
      if (error.status === 429) {
        throw new Error('Too many login attempts. Please try again later');
      }
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw new Error(
          'Unable to connect. Please check your internet connection'
        );
      }

      // Re-throw if already a business error
      if (error.message?.includes('Please enter')) {
        throw error;
      }

      throw new Error('Login failed. Please try again');
    }
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<Session> {
    try {
      // Business validation
      if (!name?.trim() || !email?.trim() || !password?.trim()) {
        throw new Error('Please fill in all required fields');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!this.isValidPassword(password)) {
        throw new Error('Password must be at least 8 characters long');
      }

      return await this.authRepository.register(
        email.trim(),
        password,
        name.trim()
      );
    } catch (error) {
      if (error.status === 409) {
        throw new Error('An account with this email already exists');
      }
      if (error.status === 422) {
        throw new Error('Please check your email format and try again');
      }
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw new Error(
          'Unable to connect. Please check your internet connection'
        );
      }

      // Re-throw if already a business error
      if (error.message?.includes('Please')) {
        throw error;
      }

      throw new Error('Registration failed. Please try again');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw new Error(
          'Unable to connect. Please check your internet connection'
        );
      }

      throw new Error('Logout failed. Please try again');
    }
  }

  async getCurrentUser(): Promise<Session | null> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error) {
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw new Error(
          'Unable to connect. Please check your internet connection'
        );
      }

      // For getCurrentUser, we might want to return null instead of throwing
      // since user might just not be logged in
      return null;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 8;
  }
}
