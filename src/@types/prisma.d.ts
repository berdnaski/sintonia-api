export type PaginationParams = {
  perPage?: number;
  page?: number;
}

type Paginate<T> = {
  data: T[],
  meta: {
    total: number,
    page: number,
    perPage: number,
    lastPage: number,
  },
}
