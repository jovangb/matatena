import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DatatableComponent, SelectionType, id } from '@swimlane/ngx-datatable';
import moment from 'moment';
import {  JSPrintManager, InstalledPrinter, ClientPrintJob } from 'jsprintmanager';
import { NavParams } from '@ionic/angular';

//Services
import { UiUtilsService } from 'src/app/services/ui-utils.service';
import { ChangeDetailModalComponent } from '../change-detail-modal/change-detail-modal.component';
import { SalesService } from 'src/app/services/sales.service';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-sale-details',
  templateUrl: './sale-details.component.html',
  styleUrls: ['./sale-details.component.scss'],
})
export class SaleDetailsComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('priceTemplate') priceTemplate: TemplateRef<any>;
  @Input('ticket') ticket: number;
  @Input('total') total: number;
  @Input('date') date: string;

  //Class variables
  columns: object[] = [];
  rows: object[] = [];
  SelectionType =  SelectionType;
  changeAvailable: boolean;
  changing: boolean = false;
  newChanges: any[] = [];
  originalDetails: any[];
  details: any[];
  changes: any[];
  currentUser: any;
  payment: any;

  constructor(
    private modalCtrl: ModalController,
    private uiUtils: UiUtilsService,
    private alertCtrl: AlertController,
    private salesService: SalesService,
    private employeeService: EmployeeService,
    private navParams: NavParams
  ) { 
    this.employeeService.currentEmployee.subscribe((user) => {
      this.currentUser = user;
    });
    this.payment = this.navParams.get('sale');
  }

  ionViewDidEnter(){
    this.columns = [
      {name: 'Código', prop: 'code'},
      {name: 'Producto', prop: 'product'},
      {name: 'Talla', prop: 'size'},
      {name: 'Precio', prop: 'price', cellTemplate: this.priceTemplate}
    ]
  }

  ngOnInit() {
    this.getSaleDetails();
    this.getChangeDetails();

    if(moment().diff(moment(this.date).format(), 'days') <= 7){
      this.changeAvailable = true
    }else{
      this.changeAvailable = false
    }
  }

  getSaleDetails(){
    this.salesService.getSalesDetails(this.ticket).subscribe(
      salesDetails => {
        console.log(salesDetails)
        this.details = salesDetails;
        this.rows = this.details.map(({id ,product, changed}) => {
          return {
            id,
            code: product.code,
            product: product.name,
            size: product.size,
            price: product.price,
            changed
          }
          })
        
        this.originalDetails = JSON.parse(JSON.stringify(this.details));

        this.rows = this.details.map(({id ,product, changed}) => {
          return {
            id,
            code: product.code,
            product: product.name,
            size: product.size,
            price: product.price,
            changed
          }
          })
      }
    )
  }

  getChangeDetails(){
    
    this.salesService.getChangeDetails(this.ticket).subscribe(
      changes => {
        console.log(changes)
        this.changes = changes.map(change => { 
          return change.change_details.map((item: any) => {
            console.log(item)
            return {
              oldDetail: {
                code: item.sale_detail.product.code,
                product: item.sale_detail.product.name,
                price: item.sale_detail.product.price
              },
              newDetail: {
                code: item.product.code,
                name: item.product.name,
                price: item.product.price,
              },
              difference: item.difference,
            }
          }) 
        })

        console.log(this.changes)
      }
    )
  }

  getRowClass = (row) => {
    return {
      'changed': row.changed === true
    }
  }

  async onChangeDetails(){
    await this.uiUtils.showAlert('Cambio', 'Seleccione los artículos que se cambiarán');
    this.changing = true;
  }

  onCancel(){
    this.modalCtrl.dismiss();
  }

  onCancelChange(){
    this.changing = false;
    this.newChanges = [];
    this.details = JSON.parse(JSON.stringify(this.originalDetails));
    this.rows = this.details.map(({id ,product, changed}) => {
      return {
        id,
        code: product.code,
        product: product.name,
        size: product.size,
        price: product.price,
        changed
      }
      })
  }

  async onSelectDetail({selected}){

    if(this.changing && selected[0].changed === false){
      const modal = await this.modalCtrl.create({
        component: ChangeDetailModalComponent,
        cssClass: 'change-detail'
      })

      await modal.present()
      modal.onDidDismiss().then(({data})=> {
        if(data){
          let difference;
          const index = this.details.findIndex(detail => detail.id === selected[0].id);
          this.details[index].changed = true;
          this.rows = this.details.map(({id ,product, changed}) => {
            return {
              id,
              code: product.code,
              product: product.name,
              size: product.size,
              price: product.price,
              changed
            }
            })

            if(data.price - selected[0].price <= 0){
              difference = 0;
            }else{
              difference = data.price - selected[0].price;
            }

          this.newChanges.push({
            oldDetail: selected[0],
            newDetail: data,
            difference
          })
        }
      })
    }else if(this.changing && selected[0].changed){
      await this.uiUtils.showToast('Este artículo ya se cambió', 'danger', 'middle', 1500)
    }
  }

  async onConfirmChange(){
    const alert = await this.alertCtrl.create({
      header: 'Método de pago',
      inputs: [
        {
          type: 'radio',
          label: 'Efectivo',
          name: 'efectivo',
          value: 'efectivo'
        },
        {
          type: 'radio',
          label: 'Tarjeta',
          name: 'tarjeta',
          value: 'tarjeta'
        }
      ],
      buttons: [
        {
          text: 'Aceptar',
          handler: async (value)  => {
            if(!value){
              return false;
            }else{
              let payment = value;
              let date = moment().format();
              let total = 0;
              this.newChanges.map(change => total += change.difference);
              const changeInfo = {
                date,
                payment,
                detailsToChange: this.newChanges,
                total
              }

              const loading = await this.uiUtils.showLoadingPrefab();

              this.salesService.newChange(this.ticket, changeInfo).subscribe(
                res => {
                  loading.dismiss();
                  this.uiUtils.showToast('Cambio realizado', 'success', 'middle', 1500);
                  //TODO: CERRAR MODAL Y RECARGAR VENTAS E IMPRIMIR TICKET
                  this.modalCtrl.dismiss();
                },
                err => {
                  loading.dismiss();
                  this.uiUtils.showToast(err.error.message, 'danger', 'middle', 1500);
                }
              )
            }
          }
        }
      ]
    })

    alert.present();

    const changeInfo = {

    }
  }

  async print() {
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
    cmds += JSON.stringify(this.date);
    cmds += newLine+newLine;
    cmds += 'ID'+'     ';
    cmds += 'Producto';
    cmds += '   '+'Precio';
    cmds += newLine;
    for(var i=0;i<this.details.length;i++){
      cmds += parseInt(this.details[i].product.code)+'  -  ';
      cmds += JSON.stringify(this.details[i].product.name).substring(1,5);
      cmds += '  -  $'+JSON.stringify(this.details[i].product.price);
      cmds += newLine;
      }
    cmds += newLine;
    cmds += newLine;
    cmds += 'Metodo de pago: '+ this.payment;
    cmds += newLine;
    cmds += esc + '!' + '\x16'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
    cmds += 'TOTAL: $'+ this.total;
    cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
    cmds += newLine;
    cmds += esc + '!' + '\x16'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
    // cmds += 'DEPOSITO: $'+ saleInfo.deposit;
    cmds += esc + '!' + '\x00'; 
    cmds += newLine + newLine;
    cmds += newLine+newLine+newLine+newLine;

    cpj.printerCommands = cmds;

    // Send print job to printer!
    cpj.sendToClient()
}

}
