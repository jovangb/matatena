import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';

//Constants
import { PREFERENCES_KEYS } from '../constants/preferences-key-constants';

@Injectable({
  providedIn: 'root'
})
export class RequestInterceptorService implements HttpInterceptor {

  apiUrl: string = `${environment.matatenaApi}`;

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    const protectedResourceMap = new Map<string, Array<string>>();

    protectedResourceMap.set(`${this.apiUrl}/employees/login`, null);

    return from(this.tokenJWT(req, next));
  }

  async tokenJWT(req: HttpRequest<any>, next: HttpHandler){
    const {value} = await Preferences.get({ key: PREFERENCES_KEYS.authData });
    const employeeData = JSON.parse(value);

    if(employeeData && employeeData.token){
      req = req.clone({
        setHeaders: {
          Authorization: `${employeeData.token}`
        }
      })
    }

    return next.handle(req).toPromise();
  }

}
