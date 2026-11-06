import { BaseRequest } from './base.request';

export class GetRequest<Output> extends BaseRequest<Output> {
  constructor(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>) {
    super({
      url: endpoint,
      method: 'GET',
      params,
    });
  }
}

