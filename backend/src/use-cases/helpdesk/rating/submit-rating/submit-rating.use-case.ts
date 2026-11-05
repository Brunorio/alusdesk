import { Injectable } from '@nestjs/common';
import { IUseCase } from '@core/use-cases/use-case.interface';
import { IRatingRepository } from '@core/modules/helpdesk/domain/rating/domain/rating.repository';
import { ITicketRepository } from '@core/modules/helpdesk/domain/ticket/domain/ticket.repository';
import { Rating, RatingOutput } from '@core/modules/helpdesk/domain/rating/domain/rating';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface SubmitRatingInput {
  ticketId: string;
  customerId: string;
  score: number;
  feedback?: string;
}

@Injectable()
export class SubmitRatingUseCase implements IUseCase<SubmitRatingInput, RatingOutput> {
  constructor(
    private readonly ratingRepository: IRatingRepository,
    private readonly ticketRepository: ITicketRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: SubmitRatingInput): Promise<RatingOutput> {
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      throw new Error('error.ticket_not_found');
    }

    const existingRating = await this.ratingRepository.findByTicketId(input.ticketId);
    if (existingRating) {
      throw new Error('error.ticket_already_rated');
    }

    const ticketOutput = ticket.getOutput();
    if (!ticketOutput.agentId) {
      throw new Error('error.ticket_has_no_agent');
    }

    const rating = new Rating({
      ticketId: input.ticketId,
      customerId: input.customerId,
      agentId: ticketOutput.agentId,
      score: input.score,
      feedback: input.feedback,
    });

    await this.ratingRepository.insert(rating);

    ticket.close();
    await this.ticketRepository.update(ticket);

    const output = rating.getOutput();
    this.eventEmitter.emit('ticket.closed', {
      ticketId: ticketOutput.id,
      rating: output,
    });

    return output;
  }
}
