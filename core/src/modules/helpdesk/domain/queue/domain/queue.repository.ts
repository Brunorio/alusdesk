import { ISearchableRepository } from '../../../../../repository/repository.interface';
import { Queue, QueueId } from './queue';

export interface IQueueRepository extends ISearchableRepository<Queue, QueueId> {
  findByOrganizationId(organizationId: string): Promise<Queue[]>;
}

