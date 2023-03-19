import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

//Interfaces
import { Employee } from '../interfaces/employee';
import { HttpResponse } from '../interfaces/http-response';

//Constants
import { PREFERENCES_KEYS } from '../constants/preferences-key-constants'

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  //Observables
  private _currentEmployee = new BehaviorSubject<Employee>(null);

  //Service variables
  private apiUrl: string = `${environment.matatenaApi}/employees`

  //Getters
  get token(){
    return this._currentEmployee.asObservable().pipe(
      switchMap(async employee =>  {
        const { value } = await Preferences.get({key: PREFERENCES_KEYS.authData});
        const employeeData = JSON.parse(value);

        if(value) return employeeData.token;
        else return null;
      }),
      map(token => token)
    );
  }

  get currentEmployee(): Observable<Employee> {
    return this._currentEmployee.asObservable().pipe(
      switchMap(async employee => {
        const { value } = await Preferences.get({key: PREFERENCES_KEYS.authData});
        const employeeData =  JSON.parse(value)

        if(value) return employeeData.employee;
        else return null;
      }),
      map(employee => employee)
    );
  }

  get employeeIsAuthenticated(): Observable<Boolean> {
    return this._currentEmployee.asObservable().pipe(
      switchMap(async employee => {
        const { value } = await Preferences.get({key: PREFERENCES_KEYS.authData});
        const employeeData = JSON.parse(value);

        if(Array.isArray(employeeData) && employeeData.length == 0){
          return false;
        }
        else if(employeeData){
          return true;
        }else return false;
      }),
      map(employee => employee)
    );
  }

  //Setters
  set currentEmployeeValue(employee: Employee){
    this._currentEmployee.next(employee)
  }

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  //*API FUNCTIONS *//
  loginEmployee(email: string, password:string){
    return this.http
    .post<HttpResponse>((`${this.apiUrl}/login`), {email, password})
    .pipe(
      switchMap(async response => {
        const {employee, token }  = response.data;

        await Preferences.set({
          key: PREFERENCES_KEYS.authData,
          value: JSON.stringify({
            employee,
            token
          })
        });

        return {...employee, token};
      }),
      take(1),
      map(employeeData => {
        this._currentEmployee.next({...employeeData});
        return employeeData;
      })
    )
  }
}
