import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

//Interfaces
import { HttpResponse } from '../interfaces/http-response';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  //Service variables
  private apiUrl: string = `${environment.matatenaApi}/products`

  constructor(
    private http: HttpClient
  ) { }

  //** API FUNCTIONS */
  getProducts(){
    return this.http.get<HttpResponse>(`${this.apiUrl}`)
    .pipe(
      switchMap(async res => {
        const { products } = res.data

        return products;
      })
    )
  }

  addProducts(products: Product[]){
    return this.http.post<HttpResponse>(`${this.apiUrl}`, {products})
    .pipe(
      switchMap(async res => {
        const {notUploadedProducts} = res.data
        return notUploadedProducts;
      })
    )
  }

  editProduct(productId: number, updatedData: object){
    return this.http.patch<HttpResponse>(`${this.apiUrl}/${productId}`, {updatedData})
    .pipe(
      switchMap(async res => {
        return res;
      })
    )
  }

  deleteProduct(productId: number){
    return this.http.delete<HttpResponse>(`${this.apiUrl}/${productId}`)
    .pipe(
      switchMap (async res => {
        return res;
      })
    )
  }
}

