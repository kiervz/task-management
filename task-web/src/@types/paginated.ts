export type Paginated<T> = {
  data: Array<T>;
  links: PaginationLink;
  meta: PaginationMeta;
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type PaginationLink = {
  current: string;
  next: string | null;
  last: string | null;
};
