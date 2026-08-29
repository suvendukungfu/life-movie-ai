export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface SessionContext {
  user: AuthUser;
  isAuthenticated: boolean;
}
