import { Product } from "./product";

export interface Rent {
  formattedDate?: string,
  date: string;
  ticket?: number;
  deliver: any,
  returning: any,
  product?: Product
}
