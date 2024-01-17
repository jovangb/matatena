import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

//Services
import { EmployeeService } from '../services/employee.service';
import { UiUtilsService } from '../services/ui-utils.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  //Class variables
  loginForm: FormGroup;

  constructor(
    private uiUtils: UiUtilsService,
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }

  async onLoginHandler(){
    if(this.loginForm.invalid) return;

    const loading = await this.uiUtils.showLoadingPrefab();

    const { email, password } = this.loginForm.value;

    this.employeeService.loginEmployee(email, password).subscribe(
      async res => {
        await loading.dismiss();
        await this.uiUtils.showToast('Sesión iniciada correctamente', 'success', 'middle', 1000);
        this.router.navigateByUrl('/home');
      },
      async err => {
        await loading.dismiss();

        this.uiUtils.showToast(err.error.message, 'danger', 'middle', 1500);
      }
    )
    
    this.loginForm.reset();
  }

}
