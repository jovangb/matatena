import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import moment from 'moment';
import { Product } from 'src/app/interfaces/product';

//Services
import { UiUtilsService } from 'src/app/services/ui-utils.service';
import { RentService } from 'src/app/services/rent.service';

@Component({
  selector: 'app-rent-detail-modal',
  templateUrl: './rent-detail-modal.component.html',
  styleUrls: ['./rent-detail-modal.component.scss'],
})
export class RentDetailModalComponent implements OnInit {
  @Input() details: Product[]; 
  @Input() total: number; 
  rentForm: FormGroup

  constructor(
    private modalCtrl: ModalController,
    private uiUtils: UiUtilsService,
    private rentService: RentService
  ) { }

  ngOnInit() {
    this.rentForm = new FormGroup({
      payment: new FormControl(Validators.required),
      deposit: new FormControl(0, Validators.required),
      deliver: new FormControl(Validators.required),
      return: new FormControl(Validators.required)
    })
  }

  async rent(){
    const date = moment().format('YYYY-MM-DD HH:mm:ss')
    const rentInfo = {
      date,
      payment: this.rentForm.controls.payment.value,
      deposit: this.rentForm.controls.deposit.value,
      deliver: this.rentForm.controls.deliver.value,
      returning: this.rentForm.controls.return.value,
      productCode: this.details[0].code,
      total: this.total
    }
    
    console.log(rentInfo)
    const loading = await this.uiUtils.showLoadingPrefab();
    this.rentService.newRent(rentInfo).subscribe(
      res => {
        this.uiUtils.showToast('Renta realizada con éxito', 'success', 'middle', 1500);
        loading.dismiss();
        this.details = []
        this.total = 0
        // this.getProducts();
        // this.getRents();
      },
      err => {
        this.uiUtils.showToast(err.error.message, 'danger', 'middle', 1500);
        loading.dismiss();
      }
    )
  }

  onCancel(){
    this.modalCtrl.dismiss();
  }

}
