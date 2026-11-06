import { Entity } from '../../../../../domain/entity';
import Input from '../../../../../domain/input';
import Output from '../../../../../domain/output';
import { QueueId } from './queue.id';
import { QueueRules } from './queue.rules';

export interface QueueInput extends Input {
  organizationId: string;
  name: string;
  priority?: number;
  isActive?: boolean;
}

export interface QueueOutput extends Output {
  organizationId: string;
  name: string;
  priority: number;
  isActive: boolean;
}

export * from './queue.id';

export class Queue extends Entity {
  private readonly id: QueueId;
  private readonly organizationId: string;
  private name: string;
  private priority: number;
  private isActive: boolean;

  constructor(input: QueueInput) {
    super(input);
    this.id = input.id ? new QueueId(input.id) : new QueueId();
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.priority = input.priority ?? 1;
    this.isActive = input.isActive ?? true;

    this.validate(new QueueRules(this.getOutput()));
  }

  public getId(): QueueId {
    return this.id;
  }

  public getOrganizationId(): string {
    return this.organizationId;
  }

  public getOutput(): QueueOutput {
    return {
      id: this.id.id,
      organizationId: this.organizationId,
      name: this.name,
      priority: this.priority,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

