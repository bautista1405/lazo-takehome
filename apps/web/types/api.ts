export type ApiError = {
  statusCode?: number;
  status?: string;
  message: string;
  details?: Record<string, unknown>;
  issues?: unknown[];
};
