import { BaseRequest } from './base.request';

export interface SearchParamsProps {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: 'asc' | 'desc' | null;
  filter?: Record<string, unknown> | null;
}

export interface SearchResultProps<E> {
  items: E[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  sort?: string | null;
  sortDir?: string | null;
  filter?: unknown;
}

export class SearchRequest<Output> extends BaseRequest<SearchResultProps<Output>> {
  constructor(endpoint: string, params?: SearchParamsProps) {
    const queryParams: Record<string, string | number | boolean | undefined | null> = {
      page: params?.page ?? 1,
      perPage: params?.perPage ?? 15,
      sort: params?.sort,
      sortDir: params?.sortDir,
    };

    if (params?.filter && typeof params.filter === 'object') {
      Object.entries(params.filter).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams[`filter[${key}]`] = String(val);
        }
      });
    }

    super({
      url: endpoint.endsWith('/search') ? endpoint : `${endpoint}/search`,
      method: 'GET',
      params: queryParams,
    });
  }
}

