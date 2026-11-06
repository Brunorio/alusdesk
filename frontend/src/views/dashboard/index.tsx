import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { PageContent } from '../../components/layout/PageContent';
import { ResponsiveData, ResponsiveDataColumn } from '../../components/data/ResponsiveData';
import { SearchResultProps, SearchParamsProps } from '../../requests/base/search.request';
import { Headphones, Clock, CheckCircle2, Star, Plus } from 'lucide-react';

interface QuickTicketItem {
  id: string;
  protocol: string;
  requesterName: string;
  queueName: string;
  status: string;
  createdAt: string;
}

const mockTickets: QuickTicketItem[] = [
  {
    id: '1',
    protocol: 'TCK-2026-0001',
    requesterName: 'Alice Johnson',
    queueName: 'Technical Support',
    status: 'WAITING_QUEUE',
    createdAt: '2026-11-06 10:15',
  },
  {
    id: '2',
    protocol: 'TCK-2026-0002',
    requesterName: 'Bob Williams',
    queueName: 'Billing & Invoicing',
    status: 'IN_PROGRESS',
    createdAt: '2026-11-06 10:30',
  },
  {
    id: '3',
    protocol: 'TCK-2026-0003',
    requesterName: 'Carlos Silva',
    queueName: 'Hardware Integration',
    status: 'WAITING_QUEUE',
    createdAt: '2026-11-06 11:00',
  },
];

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useState<SearchParamsProps>({
    page: 1,
    perPage: 10,
    sort: 'createdAt',
    sortDir: 'desc',
  });

  const searchResult: SearchResultProps<QuickTicketItem> = {
    items: mockTickets,
    total: mockTickets.length,
    currentPage: searchParams.page || 1,
    perPage: searchParams.perPage || 10,
    lastPage: 1,
    sort: searchParams.sort,
    sortDir: searchParams.sortDir,
  };

  const columns: ResponsiveDataColumn<QuickTicketItem>[] = [
    {
      id: 'protocol',
      header: 'Protocol',
      sortable: true,
      render: (item) => <span className="font-semibold text-blue-600">{item.protocol}</span>,
    },
    {
      id: 'requesterName',
      header: 'Requester',
      accessorKey: 'requesterName',
      sortable: true,
    },
    {
      id: 'queueName',
      header: 'Queue',
      accessorKey: 'queueName',
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => {
        const isWaiting = item.status === 'WAITING_QUEUE';
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isWaiting ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {isWaiting ? 'Waiting Queue' : 'In Progress'}
          </span>
        );
      },
    },
    {
      id: 'createdAt',
      header: 'Created At',
      accessorKey: 'createdAt',
      sortable: true,
    },
  ];

  return (
    <PageContent className="w-full">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time operational metrics and active queue overview"
        actions={[
          <button
            key="new-ticket"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>,
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Waiting in Queue</p>
            <h3 className="text-2xl font-bold text-slate-900">12</h3>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active In Progress</p>
            <h3 className="text-2xl font-bold text-slate-900">8</h3>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Resolved Today</p>
            <h3 className="text-2xl font-bold text-slate-900">45</h3>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">CSAT Rating</p>
            <h3 className="text-2xl font-bold text-slate-900">4.9 / 5.0</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Waiting Tickets</h2>
        </div>

        <ResponsiveData
          searchResult={searchResult}
          onChangeSearchParams={(params) => setSearchParams((prev) => ({ ...prev, ...params }))}
          desktop={{ columns }}
          mobile={{
            renderCard: (item) => (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-600">{item.protocol}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'WAITING_QUEUE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-sm text-slate-700">
                  <strong>{item.requesterName}</strong> • {item.queueName}
                </div>
                <div className="text-xs text-slate-400">{item.createdAt}</div>
              </div>
            ),
          }}
        />
      </div>
    </PageContent>
  );
}
