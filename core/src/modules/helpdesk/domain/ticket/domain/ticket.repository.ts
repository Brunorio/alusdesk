import { ISearchableRepository } from '../../../../../repository/repository.interface';
import { Ticket, TicketId } from './ticket';

export interface ITicketRepository extends ISearchableRepository<Ticket, TicketId> {
  findByProtocol(organizationId: string, protocol: string): Promise<Ticket | null | undefined>;
  countActiveSessionsByOrganization(organizationId: string): Promise<number>;
  countActiveSessionsByCompany(clientCompanyId: string): Promise<number>;
  generateProtocolNumber(organizationId: string): Promise<string>;
  claimTicketAtomically(ticketId: TicketId, agentId: string): Promise<Ticket>;
}
