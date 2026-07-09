/** Envelope every FastAPI endpoint responds with: `{ success, message, data }`. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Envelope FastAPI's global exception handlers return on failure. */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: unknown;
}

/** Shape of every paginated listing endpoint's `data` field. */
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export type SortOrder = 'asc' | 'desc';

/** Common `page`/`limit`/`sort`/`order` query params accepted by list endpoints. */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
}
