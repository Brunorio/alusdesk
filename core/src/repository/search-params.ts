export type SortDirection = 'asc' | 'desc';

export interface SearchProps<Filter = string> {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: Filter | null;
}

export class SearchParams<Filter = string> {
  protected _page: number = 1;
  protected _perPage: number = 15;
  protected _sort: string | null = null;
  protected _sortDir: SortDirection | null = null;
  protected _filter: Filter | null = null;

  constructor(props: SearchProps<Filter> = {}) {
    this.page = props.page;
    this.perPage = props.perPage;
    this.sort = props.sort;
    this.sortDir = props.sortDir;
    this.filter = props.filter;
  }

  get page(): number {
    return this._page;
  }

  private set page(value: number | undefined) {
    let _page = +value;
    if (Number.isNaN(_page) || _page <= 0 || parseInt(_page as any) !== _page) {
      _page = 1;
    }
    this._page = _page;
  }

  get perPage(): number {
    return this._perPage;
  }

  private set perPage(value: number | undefined) {
    let _perPage = value === (true as any) ? this._perPage : +value;
    if (Number.isNaN(_perPage) || _perPage <= 0 || parseInt(_perPage as any) !== _perPage) {
      _perPage = this._perPage;
    }
    this._perPage = _perPage;
  }

  get sort(): string | null {
    return this._sort;
  }

  private set sort(value: string | null | undefined) {
    this._sort = value === null || value === undefined || value === '' ? null : `${value}`;
  }

  get sortDir(): SortDirection | null {
    return this._sortDir;
  }

  private set sortDir(value: string | null | undefined) {
    if (!this.sort) {
      this._sortDir = null;
      return;
    }
    const dir = `${value}`.toLowerCase();
    this._sortDir = dir !== 'asc' && dir !== 'desc' ? 'asc' : (dir as SortDirection);
  }

  get filter(): Filter | null {
    return this._filter;
  }

  private set filter(value: Filter | null | undefined) {
    this._filter = value === null || value === undefined || (value as any) === '' ? null : value;
  }
}
