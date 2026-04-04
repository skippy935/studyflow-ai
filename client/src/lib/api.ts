const BASE = '/api';

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('sb_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export async function uploadFile(file: File): Promise<{ url: string; text: string; filename: string }> {
  const token = localStorage.getItem('sb_token');
  const form  = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export interface ExtractResult {
  text: string;
  wordCount: number;
  pageCount?: number;
  fileName: string;
  fileType: string;
  confidence: number;
  isHandwriting: boolean;
  illegibleCount: number;
}

export async function extractFile(file: File): Promise<ExtractResult> {
  const token = localStorage.getItem('sb_token');
  const form  = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}/extract`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Extraction failed');
  return data;
}
