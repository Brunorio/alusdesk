import { Notification } from '../validators/notification';

export default class EntityError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly notification: Notification,
  ) {
    super(`${entityName} validation error: ${notification.messages().join(', ')}`);
    this.name = 'EntityError';
  }
}
