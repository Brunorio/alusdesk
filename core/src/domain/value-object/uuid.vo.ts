import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { ValueObject } from './value-object';

export class Uuid extends ValueObject {
  readonly id: string;

  constructor(id?: string) {
    super();
    this.id = id || uuidv4();
    this.validate();
  }

  private validate(): void {
    if (!uuidValidate(this.id)) {
      throw new Error(`Invalid UUID: ${this.id}`);
    }
  }

  toString(): string {
    return this.id;
  }

  toJSON(): string {
    return this.id;
  }
}

