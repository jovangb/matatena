import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

//Interfaces
import { HttpResponse } from '../interfaces/http-response';
import { Rent } from '../interfaces/rent';

//Constants
import { PREFERENCES_KEYS } from '../constants/preferences-key-constants'

@Injectable({
  providedIn: 'root'
})
export class RentService {
  //Service variables
  private apiUrl: string = `${environment.matatenaApi}/rents`

  constructor(
    private http: HttpClient
  ) { }

  //* API FUNCTIONS *//
  getRents(){
    return this.http.get<HttpResponse>(`${this.apiUrl}`)
    .pipe(
      switchMap(async res => {
        const { rents } = res.data

        return rents;
      })
    )
  }

  newRent(rentInfo: Rent){
    return this.http.post<HttpResponse>(`${this.apiUrl}`, rentInfo)
    .pipe(
      switchMap(async res => {
        return res;
      })
    )
  }
}
