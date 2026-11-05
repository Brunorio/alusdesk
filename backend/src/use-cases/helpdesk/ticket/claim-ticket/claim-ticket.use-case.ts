import { Injectable } from '@nestjs/common';
import { IUseCase } from '@core/use-cases/use-case.interface';
import { ITicketRepository } from '@core/modules/helpdesk/domain/ticket/domain/ticket.repository';
import { TicketId, TicketOutput } from '@core/modules/helpdesk/domain/ticket/domain/ticket';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface ClaimTicketInput {
  ticketId: string;
  agentId: string;
}

@Injectable()
export class ClaimTicketUseCase implements IUseCase<ClaimTicketInput, TicketOutput> {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: ClaimTicketInput): Promise<TicketOutput> {
    const ticketId = new TicketId(input.ticketId);
    const ticket = await this.ticketRepository.claimTicketAtomically(ticketId, input.agentId);
    const output = ticket.getOutput();

    this.eventEmitter.emit('ticket.claimed', output);

    return output;
  }
}

