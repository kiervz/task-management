export type ApiResponse<T> = {
  code: number;
  success: boolean;
  message: string;
  response: T;
};
