export class Notification {
  private errors: Map<string, string[]> = new Map();

  addError(error: string, field?: string): void {
    const key = field || 'general';
    const current = this.errors.get(key) || [];
    current.push(error);
    this.errors.set(key, current);
  }

  hasErrors(): boolean {
    return this.errors.size > 0;
  }

  getErrors(): Map<string, string[]> {
    return this.errors;
  }

  messages(field?: string): string[] {
    if (field) {
      return this.errors.get(field) || [];
    }
    const allMessages: string[] = [];
    this.errors.forEach((messages) => allMessages.push(...messages));
    return allMessages;
  }
}
