import { BaseRequest } from './base.request';

export class DeleteRequest<Output = void> extends BaseRequest<Output> {
  constructor(endpoint: string, id: string) {
    super({
      url: `${endpoint}/${id}`,
      method: 'DELETE',
    });
  }
}
