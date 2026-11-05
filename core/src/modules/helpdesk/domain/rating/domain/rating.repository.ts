import { ISearchableRepository } from '../../../../../repository/repository.interface';
import { Rating, RatingId } from './rating';

export interface IRatingRepository extends ISearchableRepository<Rating, RatingId> {
  findByTicketId(ticketId: string): Promise<Rating | null | undefined>;
}

