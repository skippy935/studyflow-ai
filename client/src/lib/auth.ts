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
