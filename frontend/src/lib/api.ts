import type {
  ApproachStep,
  Article,
  ArticleCategory,
  ArticleList,
  ContactPayload,
  LegalPage,
  Locale,
  PageSections,
  Partner,
  Product,
  SiteSettings,
  Solution,
  ValueProp,
} from './types';

/**
 * Single source of truth for the API base URL. Nothing else in the app should
 * hardcode a host, so a deployment only needs NEXT_PUBLIC_API_URL set.
 *
 * NEXT_PUBLIC_API_URL is used for client-side requests. For server-side
 * (SSR) requests, we prefer API_URL (server-only) so the Next.js server
 * can reach the backend directly without going through the public proxy.
 */
const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';
const SERVER_API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://backend:8080/api';

export const API_BASE_URL = (
  typeof window === 'undefined' ? SERVER_API_URL : CLIENT_API_URL
).replace(/\/$/, '');

/** How long server-rendered content may be cached before revalidation. */
const REVALIDATE_SECONDS = 300;

type Query = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions {
  query?: Query;
  revalidate?: number | false;
}

async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { query, revalidate = REVALIDATE_SECONDS } = options;

  const response = await fetch(buildUrl(path, query), {
    headers: { Accept: 'application/json' },
    ...(revalidate === false
      ? { cache: 'no-store' as const }
      : { next: { revalidate } }),
  });

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      path,
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Wraps a request so a backend outage degrades the page instead of breaking it.
 * Returns the fallback and logs server-side rather than surfacing a stack trace.
 */
async function apiGetSafe<T>(
  path: string,
  fallback: T,
  options: FetchOptions = {},
): Promise<T> {
  try {
    return await apiGet<T>(path, options);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[api] GET ${path} failed:`, (error as Error).message);
    }
    return fallback;
  }
}

// --- Global content ---------------------------------------------------------

export function getSettings(locale: Locale): Promise<SiteSettings> {
  return apiGetSafe<SiteSettings>('/settings', {}, { query: { locale } });
}

export function getSections(locale: Locale): Promise<PageSections> {
  return apiGetSafe<PageSections>('/sections', {}, { query: { locale } });
}

export function getPartners(): Promise<Partner[]> {
  return apiGetSafe<Partner[]>('/partners', []);
}

export function getValueProps(locale: Locale): Promise<ValueProp[]> {
  return apiGetSafe<ValueProp[]>('/value-props', [], { query: { locale } });
}

export function getApproachSteps(locale: Locale): Promise<ApproachStep[]> {
  return apiGetSafe<ApproachStep[]>('/approach-steps', [], { query: { locale } });
}

// --- Solutions --------------------------------------------------------------

export function getSolutions(locale: Locale): Promise<Solution[]> {
  return apiGetSafe<Solution[]>('/solutions', [], { query: { locale } });
}

/** Throws ApiError on 404 so the page can trigger notFound(). */
export function getSolution(slug: string, locale: Locale): Promise<Solution> {
  return apiGet<Solution>(`/solutions/${encodeURIComponent(slug)}`, {
    query: { locale },
  });
}

// --- Products ---------------------------------------------------------------

export function getProducts(locale: Locale): Promise<Product[]> {
  return apiGetSafe<Product[]>('/products', [], { query: { locale } });
}

export function getProduct(slug: string, locale: Locale): Promise<Product> {
  return apiGet<Product>(`/products/${encodeURIComponent(slug)}`, {
    query: { locale },
  });
}

// --- Articles ---------------------------------------------------------------

const emptyArticleList: ArticleList = {
  items: [],
  total: 0,
  page: 1,
  limit: 0,
  has_more: false,
};

export function getArticleCategories(locale: Locale): Promise<ArticleCategory[]> {
  return apiGetSafe<ArticleCategory[]>('/article-categories', [], {
    query: { locale },
  });
}

export function getArticles(
  locale: Locale,
  params: { category?: string; page?: number; limit?: number; featured?: boolean; exclude?: string } = {},
): Promise<ArticleList> {
  return apiGetSafe<ArticleList>('/articles', emptyArticleList, {
    query: { locale, ...params },
  });
}

export function getArticle(slug: string, locale: Locale): Promise<Article> {
  return apiGet<Article>(`/articles/${encodeURIComponent(slug)}`, {
    query: { locale },
    // View counting means the response is not cacheable.
    revalidate: false,
  });
}

// --- Legal ------------------------------------------------------------------

export function getLegalPage(slug: string, locale: Locale): Promise<LegalPage> {
  return apiGet<LegalPage>(`/legal/${encodeURIComponent(slug)}`, {
    query: { locale },
  });
}

// --- Mutations (client side) -------------------------------------------------

export async function submitContact(payload: ContactPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Non-JSON error body; keep the status-based message.
    }
    throw new ApiError(message, response.status, '/contact');
  }
}

// --- Customer service chat ----------------------------------------------------

export interface ChatRedirect {
  type: 'whatsapp';
  label: string;
  url: string;
  message: string;
}

export interface ChatMeta {
  intent: string;
  redirect?: ChatRedirect;
}

/**
 * Sends a free-text message to the customer service bot and streams the reply
 * as newline-delimited JSON so the widget can render a human typing effect.
 *
 * @param message  The visitor's message.
 * @param locale   Chat language (id | en).
 * @param onMeta   Called once with the intent/redirect before any text arrives.
 * @param onDelta  Called with each text fragment as it streams in.
 */
export async function streamChatMessage(
  message: string,
  locale: Locale,
  onMeta: (meta: ChatMeta) => void,
  onDelta: (text: string) => void,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, locale }),
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) errorMessage = body.error;
    } catch {
      // Non-JSON error body; keep the status-based message.
    }
    throw new ApiError(errorMessage, response.status, '/chat');
  }

  if (!response.body) {
    throw new ApiError('Streaming is not supported', response.status, '/chat');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let event: { type?: string; text?: string; intent?: string; redirect?: ChatRedirect };
      try {
        event = JSON.parse(trimmed) as { type?: string; text?: string; intent?: string; redirect?: ChatRedirect };
      } catch {
        continue;
      }
      if (event.type === 'meta') {
        onMeta({ intent: event.intent ?? 'fallback', redirect: event.redirect });
      } else if (event.type === 'delta' && event.text) {
        onDelta(event.text);
      }
    }

    if (done) break;
  }
}
