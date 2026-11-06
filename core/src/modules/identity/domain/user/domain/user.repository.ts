import { ISearchableRepository } from '../../../../../repository/repository.interface';
import { User, UserId } from './user';

export interface IUserRepository extends ISearchableRepository<User, UserId> {
  findByEmail(email: string): Promise<User | null | undefined>;
}

