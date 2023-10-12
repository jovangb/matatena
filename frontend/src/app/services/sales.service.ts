import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

//Interfaces
import { HttpResponse } from '../interfaces/http-response';
import { Sale } from '../interfaces/sale';
import { Change } from '../interfaces/change';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  //Service variables
  private apiUrl: string = `${environment.matatenaApi}/sales`

  constructor(
    private http: HttpClient
  ) { }

  //**API FUNCTIONS */
  getSales(){
    return this.http.get<HttpResponse>(`${this.apiUrl}`)
    .pipe(
      switchMap(async res => {
        const { sales } = res.data

        return sales;
      })
    )
  }
  
  getSalesDetails(saleTicket: number){
    return this.http.get<HttpResponse>(`${this.apiUrl}/saleDetails/${saleTicket}`)
    .pipe(
      switchMap(async res => {
        const { salesDetails } = res.data

        return salesDetails;
      })
    )
  }

  newSale(saleInfo: Sale){
    return this.http.post<HttpResponse>(`${this.apiUrl}`, saleInfo)
    .pipe(
      switchMap(async res => {
        return res;
      })
    )

  }

  newChange(saleTicket: number, changeInfo: any){
    return this.http.post<HttpResponse>(`${this.apiUrl}/change/${saleTicket}`, changeInfo)
    .pipe(
      switchMap(async res => {
        return res;
      })
    )
  }

  getChangeDetails(saleTicket: number){
    return this.http.get<HttpResponse>(`${this.apiUrl}/changeDetails/${saleTicket}`)
    .pipe(
      switchMap(async res => {
        const { changes } = res.data

        return changes;
      })
    )
  }
}
