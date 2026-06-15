/**
 * Generic paginated response interface.
 * All paginated service methods MUST return this type
 * instead of inline object literals.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
