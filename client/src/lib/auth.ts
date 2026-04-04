import { User } from '../types';

export function getToken(): string | null {
  return localStorage.getItem('sb_token');
}

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem('sb_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(token: string, user: User): void {
  localStorage.setItem('sb_token', token);
  localStorage.setItem('sb_user', JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isEmailVerified(): boolean {
  const user = getUser();
  // Default true for existing users who predate verification
  return (user as any)?.emailVerified !== false;
}

export function setEmailVerified(): void {
  const user = getUser();
  if (user) {
    localStorage.setItem('sb_user', JSON.stringify({ ...user, emailVerified: true }));
  }
}
