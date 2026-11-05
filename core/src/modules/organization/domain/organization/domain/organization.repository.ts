import { ISearchableRepository } from '../../../../../repository/repository.interface';
import { Organization, OrganizationId } from './organization';

export interface IOrganizationRepository extends ISearchableRepository<Organization, OrganizationId> {
  findByDocumentNumber(documentNumber: string): Promise<Organization | null | undefined>;
}
