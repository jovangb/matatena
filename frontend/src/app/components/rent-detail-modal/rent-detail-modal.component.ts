import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import moment from 'moment';
import { Product } from 'src/app/interfaces/product';
import {  JSPrintManager, InstalledPrinter, ClientPrintJob } from 'jsprintmanager';
import { NavParams } from '@ionic/angular';
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
  formIsValid: boolean = false;
  ticket: any

  constructor(
    private modalCtrl: ModalController,
    private uiUtils: UiUtilsService,
    private rentService: RentService,
    private navParams: NavParams
  ) { this.ticket = this.navParams.get(this.ticket)}


  ngOnInit() {
    this.rentForm = new FormGroup({
      payment: new FormControl('', Validators.required),
      deposit: new FormControl(0, Validators.required),
      deliver: new FormControl('', Validators.required),
      return: new FormControl('', Validators.required),
    });

    this.rentForm.valueChanges.subscribe(() => {
      this.formIsValid = this.rentForm.valid;
    });
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
      productName: this.details[0].name,
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
        this.modalCtrl.dismiss();
      },
      err => {
        this.uiUtils.showToast(err.error.message, 'danger', 'middle', 1500);
        loading.dismiss();
      }
    )
    this.print(rentInfo,this.total);
    // console.log(rentInfo.date);
  }

  async print(saleInfo, total) {
    JSPrintManager.auto_reconnect = true;
    await JSPrintManager.start()

    // Create a ClientPrintJob
    var cpj = new ClientPrintJob();
    // Set Printer type (Refer to the help, there many of them!)
    cpj.clientPrinter = new InstalledPrinter('ZJ-58 11.3.0.1 U');

    // Resto del código de impresión
    var esc = '\x1B'; //ESC byte in hex notation
    var newLine = '\x0A'; //LF byte in hex notation

    var cmds = esc + "@"; //Initializes the printer (ESC @)
    cmds += esc + '!' + '\x18'; //Emphasized + Double-height + Double-width mode selected (ESC ! (8 + 16 + 32)) 56 dec => 38 hex
    cmds += 'Disfraces Matatena'; //text to print
    cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
    cmds += newLine + newLine;
    cmds += 'No. de renta: '+ this.ticket;
    cmds += newLine;
    cmds += JSON.stringify(saleInfo.date);
    cmds += newLine+newLine;
    cmds += 'ID'+'     ';
    cmds += 'Producto';
    cmds += '   '+'Precio';
    cmds += newLine;
    cmds += parseInt(saleInfo.productCode)+'  -  ';
    cmds += JSON.stringify(saleInfo.productName).substring(1,5);
    cmds += '  -  $'+JSON.stringify(saleInfo.total);
    cmds += newLine;
    cmds += newLine + newLine;
    cmds += 'Este ticket representa un servicio, NO una venta';
    cmds += newLine;
    cmds += 'Metodo de pago: '+ saleInfo.payment;
    cmds += newLine;
    cmds += esc + '!' + '\x16'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
    cmds += 'TOTAL: $'+ total;
    cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
    cmds += newLine;
    cmds += esc + '!' + '\x16'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
    cmds += 'DEPOSITO: $'+ saleInfo.deposit;
    cmds += esc + '!' + '\x00'; 
    cmds += newLine + newLine;
    cmds += newLine+newLine+newLine+newLine;

    cpj.printerCommands = cmds;

    // Send print job to printer!
    cpj.sendToClient()
}


  onCancel(){
    this.modalCtrl.dismiss();
  }

}
