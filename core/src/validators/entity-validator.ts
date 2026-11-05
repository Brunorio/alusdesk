import { validateSync } from 'class-validator';
import { EntityRules } from './entity-rules';
import { Notification } from './notification';

export class EntityValidator {
  private notification: Notification = new Notification();

  constructor(private readonly rules: EntityRules) {}

  validate(): boolean {
    const errors = validateSync(this.rules);
    if (errors.length > 0) {
      for (const error of errors) {
        if (error.constraints) {
          Object.values(error.constraints).forEach((msg) => {
            this.notification.addError(msg, error.property);
          });
        }
      }
      return false;
    }
    return true;
  }

  getNotification(): Notification {
    return this.notification;
  }
}

