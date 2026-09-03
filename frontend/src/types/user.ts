export type PlanTier = 'anonymous' | 'pro' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanTier;
  avatarUrl?: string | null;
  hasPassword?: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
