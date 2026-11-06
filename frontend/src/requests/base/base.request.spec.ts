import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseRequest } from './base.request';
import { useAuthStore } from '../../store/auth.store';

class TestRequest extends BaseRequest<{ success: boolean }> {
  constructor(requiresAuth = true) {
    super({
      url: '/test',
      method: 'GET',
      requiresAuth,
    });
  }
}

describe('BaseRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().logout();
  });

  it('should inject Authorization Bearer header when token is present', async () => {
    useAuthStore.getState().setSession('sample-opaque-uuid-token', {
      id: 'user-1',
      name: 'Agent',
      email: 'agent@test.com',
      role: 'ADMIN',
      organizationId: 'org-1',
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = new TestRequest(true);
    const result = await request.execute();

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer sample-opaque-uuid-token',
        }),
      }),
    );
  });

  it('should evict session on 401 Unauthorized', async () => {
    useAuthStore.getState().setSession('expired-token', {
      id: 'user-1',
      name: 'Agent',
      email: 'agent@test.com',
      role: 'ADMIN',
      organizationId: 'org-1',
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Session expired' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = new TestRequest(true);
    await expect(request.execute()).rejects.toThrow('Unauthorized');

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });
});

