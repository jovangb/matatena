import { Employee } from "./employee";
import { Product } from "./product";
import { Rent } from "./rent";
import { Sale } from "./sale";

export interface HttpResponse {
  status: string;
  data: {
    employee: Employee,
    token: string,
    products: Product[],
    notUploadedProducts: Product[]
    sales: Sale[]
    rents: Rent[]
    salesDetails: any[]
    changes: any[]
  }
}
