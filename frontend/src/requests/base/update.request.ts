import { BaseRequest } from './base.request';

export class UpdateRequest<Input, Output> extends BaseRequest<Output> {
  constructor(endpoint: string, id: string, input: Input) {
    super({
      url: `${endpoint}/${id}`,
      method: 'PUT',
      body: input,
    });
  }
}
