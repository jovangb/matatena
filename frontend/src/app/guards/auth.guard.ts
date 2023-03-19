import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { take, tap, switchMap } from 'rxjs';
import { Observable, of } from 'rxjs';

//Services
import { EmployeeService } from '../services/employee.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.employeeService.employeeIsAuthenticated.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if(!isAuthenticated){
          return of(false)
        }
        return of(true)
      }),
      tap(isAuthenticated => {
        if(!isAuthenticated){
          this.router.navigateByUrl('/login');
        }
      })
    )
  }

}
