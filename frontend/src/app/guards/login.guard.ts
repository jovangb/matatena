import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { EmployeeService } from '../services/employee.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanLoad {
  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ){}
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.employeeService.employeeIsAuthenticated.pipe(
      take(1),
      map(isAuthenticated => {
        console.log(isAuthenticated);
        if(isAuthenticated){
          this.router.navigateByUrl('home');
          return false
        }else{
          return true
        }
      })
    );
  }
}
