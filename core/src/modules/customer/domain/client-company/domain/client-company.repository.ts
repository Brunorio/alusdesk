import { ISearchableRepository } from '../../../../../repository/repository.interface';
import { ClientCompany, ClientCompanyId } from './client-company';

export interface IClientCompanyRepository extends ISearchableRepository<ClientCompany, ClientCompanyId> {
  findByDocumentNumber(organizationId: string, documentNumber: string): Promise<ClientCompany | null | undefined>;
}

