import { Entity } from '../../../../../domain/entity';
import Input from '../../../../../domain/input';
import Output from '../../../../../domain/output';
import { TicketId } from './ticket.id';
import { TicketRules } from './ticket.rules';
import { TicketStatus } from '../enums/ticket-status.enum';
import { SessionType } from '../enums/session-type.enum';

export interface TicketInput extends Input {
  organizationId: string;
  protocolNumber: string;
  clientCompanyId: string;
  requesterId: string;
  queueId: string;
  agentId?: string;
  status?: TicketStatus;
  activeChannel?: SessionType;
  enteredQueueAt?: Date;
  claimedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  queueWaitTimeSec?: number;
  totalDurationSec?: number;
}

export interface TicketOutput extends Output {
  organizationId: string;
  protocolNumber: string;
  clientCompanyId: string;
  requesterId: string;
  queueId: string;
  agentId?: string;
  status: TicketStatus;
  activeChannel: SessionType;
  enteredQueueAt: Date;
  claimedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  queueWaitTimeSec?: number;
  totalDurationSec?: number;
}

export * from './ticket.id';
export class Ticket extends Entity {
  private readonly id: TicketId;
  private readonly organizationId: string;
  private readonly protocolNumber: string;
  private readonly clientCompanyId: string;
  private readonly requesterId: string;
  private readonly queueId: string;
  private agentId?: string;
  private status: TicketStatus;
  private activeChannel: SessionType;
  private enteredQueueAt: Date;
  private claimedAt?: Date;
  private resolvedAt?: Date;
  private closedAt?: Date;
  private queueWaitTimeSec?: number;
  private totalDurationSec?: number;

  constructor(input: TicketInput) {
    super(input);
    this.id = input.id ? new TicketId(input.id) : new TicketId();
    this.organizationId = input.organizationId;
    this.protocolNumber = input.protocolNumber;
    this.clientCompanyId = input.clientCompanyId;
    this.requesterId = input.requesterId;
    this.queueId = input.queueId;
    this.agentId = input.agentId;
    this.status = input.status ?? TicketStatus.WAITING_QUEUE;
    this.activeChannel = input.activeChannel ?? SessionType.CHAT_ONLY;
    this.enteredQueueAt = input.enteredQueueAt ?? new Date();
    this.claimedAt = input.claimedAt;
    this.resolvedAt = input.resolvedAt;
    this.closedAt = input.closedAt;
    this.queueWaitTimeSec = input.queueWaitTimeSec;
    this.totalDurationSec = input.totalDurationSec;

    this.validate(new TicketRules(this.getOutput()));
  }

  public claim(agentId: string): void {
    if (this.status !== TicketStatus.WAITING_QUEUE) {
      throw new Error('error.ticket_already_claimed_or_processed');
    }
    const now = new Date();
    this.agentId = agentId;
    this.status = TicketStatus.IN_PROGRESS;
    this.claimedAt = now;
    this.queueWaitTimeSec = Math.max(0, Math.floor((now.getTime() - this.enteredQueueAt.getTime()) / 1000));
  }

  public switchChannel(newChannel: SessionType): void {
    if (this.status !== TicketStatus.IN_PROGRESS) {
      throw new Error('error.ticket_not_in_progress');
    }
    this.activeChannel = newChannel;
  }

  public resolve(): void {
    if (this.status !== TicketStatus.IN_PROGRESS) {
      throw new Error('error.ticket_not_in_progress');
    }
    const now = new Date();
    this.status = TicketStatus.RESOLVED;
    this.resolvedAt = now;
    if (this.claimedAt) {
      this.totalDurationSec = Math.max(0, Math.floor((now.getTime() - this.claimedAt.getTime()) / 1000));
    }
  }

  public close(): void {
    if (this.status === TicketStatus.CLOSED || this.status === TicketStatus.CANCELLED) {
      throw new Error('error.ticket_already_terminal');
    }
    this.status = TicketStatus.CLOSED;
    this.closedAt = new Date();
  }

  public getId(): TicketId {
    return this.id;
  }

  public getOutput(): TicketOutput {
    return {
      id: this.id.id,
      organizationId: this.organizationId,
      protocolNumber: this.protocolNumber,
      clientCompanyId: this.clientCompanyId,
      requesterId: this.requesterId,
      queueId: this.queueId,
      agentId: this.agentId,
      status: this.status,
      activeChannel: this.activeChannel,
      enteredQueueAt: this.enteredQueueAt,
      claimedAt: this.claimedAt,
      resolvedAt: this.resolvedAt,
      closedAt: this.closedAt,
      queueWaitTimeSec: this.queueWaitTimeSec,
      totalDurationSec: this.totalDurationSec,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
