'use client';

import { API_BASE_URL } from '@/lib/api';

/**
 * Admin API client.
 *
 * The JWT is kept in sessionStorage only: it disappears when the tab closes and
 * is never written to a cookie, so it cannot be replayed by a cross-site
 * request. There is deliberately no offline or mock fallback — if the API is
 * unreachable, the user stays logged out rather than seeing a fake session.
 */

const TOKEN_KEY = 'rams_admin_token';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.sessionStorage.removeItem(TOKEN_KEY);
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // Fall through to the status-based message.
  }
  return `Permintaan gagal (${response.status})`;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Skips the Authorization header, used by login. */
  anonymous?: boolean;
}

export async function adminRequest<T>(
  path: string,
  { method = 'GET', body, anonymous = false }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (!anonymous) {
    const token = getToken();
    if (!token) throw new AdminApiError('Sesi berakhir. Silakan masuk kembali.', 401);
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    cache: 'no-store',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401) {
    clearToken();
    throw new AdminApiError('Sesi berakhir. Silakan masuk kembali.', 401);
  }
  if (!response.ok) {
    throw new AdminApiError(await parseError(response), response.status);
  }
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export async function login(username: string, password: string) {
  const result = await adminRequest<{ token: string; user: AdminUser }>('/auth/login', {
    method: 'POST',
    body: { username, password },
    anonymous: true,
  });
  setToken(result.token);
  return result.user;
}

export function fetchMe() {
  return adminRequest<AdminUser>('/admin/me');
}

/** Uploads a single image and returns the stored asset. */
export async function uploadMedia(file: File) {
  const token = getToken();
  if (!token) throw new AdminApiError('Sesi berakhir. Silakan masuk kembali.', 401);

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (response.status === 401) {
    clearToken();
    throw new AdminApiError('Sesi berakhir. Silakan masuk kembali.', 401);
  }
  if (!response.ok) {
    throw new AdminApiError(await parseError(response), response.status);
  }

  return response.json() as Promise<MediaAsset>;
}

// --- Admin payload shapes ---------------------------------------------------

export interface MediaAsset {
  id: number;
  file_name: string;
  original_name: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface AdminStats {
  total_solutions: number;
  total_articles: number;
  total_drafts: number;
  total_inquiries: number;
  unread_inquiries: number;
  total_media: number;
}

export interface AdminArticleCategory {
  id: number;
  slug: string;
  name_id: string;
  name_en: string;
  order: number;
}

export interface AdminArticle {
  id: number;
  slug: string;
  category_id: number;
  title_id: string;
  title_en: string;
  excerpt_id: string;
  excerpt_en: string;
  content_id: string;
  content_en: string;
  image_url: string;
  author: string;
  status: string;
  featured: boolean;
  views: number;
  read_time: string;
  published_at: string;
  category?: AdminArticleCategory | null;
}

export interface AdminSolutionFeature {
  id?: number;
  solution_id?: number;
  label_id: string;
  label_en: string;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
  image_url: string;
  order: number;
}

export interface AdminSolutionUseCase {
  id?: number;
  solution_id?: number;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
  order: number;
}

export interface AdminSolution {
  id: number;
  slug: string;
  name_id: string;
  name_en: string;
  eyebrow_id: string;
  eyebrow_en: string;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
  summary_id: string;
  summary_en: string;
  icon_url: string;
  card_image_url: string;
  hero_image_url: string;
  cta_label_id: string;
  cta_label_en: string;
  cta_href: string;
  feature_title_id: string;
  feature_title_en: string;
  capability_title_id: string;
  capability_title_en: string;
  capability_image: string;
  cta_title_id: string;
  cta_title_en: string;
  cta_banner: string;
  order: number;
  published: boolean;
  features: AdminSolutionFeature[];
  use_cases: AdminSolutionUseCase[];
}

export interface AdminInquiry {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  solution_interest: string;
  message: string;
  locale: string;
  status: string;
  created_at: string;
}

export interface AdminPartner {
  id: number;
  name: string;
  logo_url: string;
  website: string;
  order: number;
  active: boolean;
}

export interface AdminValueProp {
  id: number;
  icon_url: string;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
  order: number;
}

export interface AdminApproachStep {
  id: number;
  number: string;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
  image_url: string;
  order: number;
}

export interface AdminPageSection {
  id: number;
  key: string;
  eyebrow_id: string;
  eyebrow_en: string;
  title_id: string;
  title_en: string;
  subtitle_id: string;
  subtitle_en: string;
  desc_id: string;
  desc_en: string;
  image_url: string;
  image_mobile_url: string;
  cta_label_id: string;
  cta_label_en: string;
  cta_href: string;
}

export interface AdminSetting {
  id?: number;
  key: string;
  value_id: string;
  value_en: string;
}

export interface AdminLegalPage {
  id: number;
  slug: string;
  title_id: string;
  title_en: string;
  body_id: string;
  body_en: string;
  updated_at: string;
}

export interface AdminProductValue {
  id?: number;
  product_id?: number;
  letter: string;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
  image_url: string;
  order: number;
}

export interface AdminProductFeature {
  id?: number;
  product_id?: number;
  title_id: string;
  title_en: string;
  desc_id: string;
  desc_en: string;
  image_url: string;
  order: number;
}

export interface AdminProduct {
  id: number;
  slug: string;
  name_id: string;
  name_en: string;
  title_id: string;
  title_en: string;
  tagline_id: string;
  tagline_en: string;
  logo_url: string;
  hero_image_url: string;
  prompts_id: string;
  prompts_en: string;
  acronym_title_id: string;
  acronym_title_en: string;
  cta_title_id: string;
  cta_title_en: string;
  cta_label_id: string;
  cta_label_en: string;
  cta_href: string;
  order: number;
  published: boolean;
  values: AdminProductValue[];
  features: AdminProductFeature[];
}
