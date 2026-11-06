import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveData, ResponsiveDataColumn } from './ResponsiveData';
import { SearchResultProps } from '../../requests/base/search.request';

interface TestItem {
  id: string;
  name: string;
}

describe('ResponsiveData Component', () => {
  const columns: ResponsiveDataColumn<TestItem>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
    },
  ];

  it('should render items in table format', () => {
    const mockData: SearchResultProps<TestItem> = {
      items: [{ id: '1', name: 'Alpha Item' }, { id: '2', name: 'Beta Item' }],
      total: 2,
      currentPage: 1,
      perPage: 10,
      lastPage: 1,
      sort: null,
      sortDir: null,
    };

    render(
      <ResponsiveData
        searchResult={mockData}
        onChangeSearchParams={vi.fn()}
        desktop={{ columns }}
        mobile={{ renderCard: (item) => <div>{item.name}</div> }}
      />,
    );

    expect(screen.getAllByText('Alpha Item')).toHaveLength(2);
    expect(screen.getAllByText('Beta Item')).toHaveLength(2);
  });

  it('should trigger onChangeSearchParams when clicking sortable header', () => {
    const onChangeSearchParams = vi.fn();
    const mockData: SearchResultProps<TestItem> = {
      items: [{ id: '1', name: 'Alpha Item' }],
      total: 1,
      currentPage: 1,
      perPage: 10,
      lastPage: 1,
      sort: null,
      sortDir: null,
    };

    render(
      <ResponsiveData
        searchResult={mockData}
        onChangeSearchParams={onChangeSearchParams}
        desktop={{ columns }}
        mobile={{ renderCard: (item) => <div>{item.name}</div> }}
      />,
    );

    fireEvent.click(screen.getByText('Name'));
    expect(onChangeSearchParams).toHaveBeenCalledWith({
      sort: 'name',
      sortDir: 'asc',
      page: 1,
    });
  });

  it('should render empty state when no items exist', () => {
    const mockData: SearchResultProps<TestItem> = {
      items: [],
      total: 0,
      currentPage: 1,
      perPage: 10,
      lastPage: 1,
      sort: null,
      sortDir: null,
    };

    render(
      <ResponsiveData
        searchResult={mockData}
        onChangeSearchParams={vi.fn()}
        desktop={{ columns }}
        mobile={{ renderCard: (item) => <div>{item.name}</div> }}
      />,
    );

    expect(screen.getByText('No records found')).toBeInTheDocument();
  });
});
