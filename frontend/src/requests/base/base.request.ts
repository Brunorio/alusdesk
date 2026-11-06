import { useAuthStore } from '../../store/auth.store';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export abstract class BaseRequest<Output> {
  protected readonly baseUrl: string;

  constructor(protected readonly config: RequestConfig) {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  protected buildUrl(): string {
    const cleanUrl = this.config.url.startsWith('/') ? this.config.url : `/${this.config.url}`;
    const url = new URL(`${this.baseUrl}${cleanUrl}`, window.location.origin);

    if (this.config.params) {
      Object.entries(this.config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async execute(): Promise<Output> {
    const fullUrl = this.buildUrl();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    const requiresAuth = this.config.requiresAuth ?? true;
    if (requiresAuth) {
      const token = useAuthStore.getState().token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(fullUrl, {
      method: this.config.method || 'GET',
      headers,
      body: this.config.body ? JSON.stringify(this.config.body) : undefined,
    });

    if (response.status === 401 && requiresAuth) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message;
        }
      } catch {
        // Response was not JSON
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as Output;
    }

    const data = await response.json();
    return data as Output;
  }
}

