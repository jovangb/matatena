export interface Sale {
  ticket?: number;
  date: string;
  total: number;
  payment: string;
  details: any[];
  formattedDate?: string
}
