import { BaseRequest } from './base.request';

export class CreateRequest<Input, Output> extends BaseRequest<Output> {
  constructor(endpoint: string, input: Input) {
    super({
      url: endpoint,
      method: 'POST',
      body: input,
    });
  }
}

