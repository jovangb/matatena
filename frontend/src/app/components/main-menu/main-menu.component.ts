import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { log } from 'console';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {}

  onNavigate(route: 'products' | 'home' | 'rents' | 'sales'){
    this.router.navigateByUrl(`/${route}`)
    this.menuCtrl.toggle();
  }


  async logOut(){
    try{
      const logOut = await this.employeeService.logoutEmployee();
      this.menuCtrl.toggle();
    }
    catch(error){
      console.log("Ha ocurrido un error en el LogOut",error);
    }
  }
}
