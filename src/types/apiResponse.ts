export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
  meta: null | {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    sort: string;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message: string;
};