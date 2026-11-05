import { ISearchableRepository } from '../../../../../repository/repository.interface';
import { Message, MessageId } from './message';

export interface IMessageRepository extends ISearchableRepository<Message, MessageId> {
  findByTicketId(ticketId: string): Promise<Message[]>;
}

