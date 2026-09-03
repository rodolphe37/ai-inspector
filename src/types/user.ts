export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'business';
}
