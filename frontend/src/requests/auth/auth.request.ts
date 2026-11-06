import { BaseRequest } from '../base/base.request';
import { UserSession } from '../../store/auth.store';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  user: UserSession;
}

export class LoginRequest extends BaseRequest<LoginOutput> {
  constructor(input: LoginInput) {
    super({
      url: '/auth/login',
      method: 'POST',
      body: input,
      requiresAuth: false,
    });
  }
}

export class LogoutRequest extends BaseRequest<void> {
  constructor() {
    super({
      url: '/auth/logout',
      method: 'POST',
      requiresAuth: true,
    });
  }
}

