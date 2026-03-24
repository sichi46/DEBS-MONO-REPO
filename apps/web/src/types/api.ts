export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type PaginatedResponse<T> = T[];
