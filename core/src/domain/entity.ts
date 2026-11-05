import EntityError from '../errors/entity.error';
import { Uuid } from './value-object/uuid.vo';
import { EntityRules } from '../validators/entity-rules';
import { EntityValidator } from '../validators/entity-validator';
import { Notification } from '../validators/notification';
import Input from './input';
import Output from './output';

export abstract class Entity {
  protected createdAt: Date;
  protected updatedAt?: Date;

  constructor(input?: Input) {
    this.createdAt = this.buildDate(input?.createdAt);
    if (input?.updatedAt) {
      this.updatedAt = this.buildDate(input.updatedAt);
    }
  }

  private buildDate(date?: Date | string): Date {
    if (date === undefined) return new Date();
    if (date instanceof Date) return date;
    return new Date(date);
  }

  abstract getId(): Uuid;
  abstract getOutput(): Output;

  throw(notification: Notification): void {
    throw new EntityError(this.constructor.name, notification);
  }

  protected validate(rules: EntityRules): void {
    Object.assign(rules, this.getOutput());
    const validator = new EntityValidator(rules);
    const isValid = validator.validate();
    if (!isValid) {
      this.throw(validator.getNotification());
    }
  }
}

