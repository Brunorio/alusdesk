import { User, UserId, UserRole, UserStatus } from './user';

describe('User Domain Unit Tests', () => {
  it('should create a valid User instance', () => {
    const user = new User({
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      name: 'Agent Smith',
      email: 'smith@matrix.internal',
      passwordHash: 'hash123456',
      role: UserRole.AGENT,
    });

    expect(user).toBeInstanceOf(User);
    expect(user.getId()).toBeInstanceOf(UserId);
    expect(user.getOutput().status).toBe(UserStatus.OFFLINE);
  });

  it('should allow status transitions', () => {
    const user = new User({
      organizationId: '80562e84-1886-455b-bb57-b0a1f26f7c9e',
      name: 'Agent Smith',
      email: 'smith@matrix.internal',
      passwordHash: 'hash123456',
      role: UserRole.AGENT,
    });

    user.updateStatus(UserStatus.ONLINE);
    expect(user.getOutput().status).toBe(UserStatus.ONLINE);
    expect(user.getOutput().updatedAt).toBeInstanceOf(Date);
  });
});

