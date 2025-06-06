import { Session } from './Session.entity';

export interface IAuthRepository {
  login(email: string, password: string): Promise<Session>;
  register(namee: string, email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<Session>;
}
