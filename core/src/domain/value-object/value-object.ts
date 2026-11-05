export abstract class ValueObject {
  public equals(obj: this): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }

    if (obj.constructor.name !== this.constructor.name) {
      return false;
    }

    return JSON.stringify(this) === JSON.stringify(obj);
  }

  abstract toString(): string;
  abstract toJSON(): any;
}
