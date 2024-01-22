import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import moment from 'moment';
import { AlertController } from '@ionic/angular';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ModalController } from '@ionic/angular';
import {  JSPrintManager, InstalledPrinter, ClientPrintJob } from 'jsprintmanager';

//Services
import { ProductService } from '../services/product.service';
import { Product } from '../interfaces/product';
import { UiUtilsService } from '../services/ui-utils.service';
import { SalesService } from '../services/sales.service';

//Interfaces
import { Sale } from '../interfaces/sale';
import { SaleDetailsComponent } from '../components/sale-details/sale-details.component';


@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
})
export class SalesPage implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('productAutocomplete') productAutocomplete;
  @ViewChild('totalTemplate') totalTemplate: TemplateRef<any>;

  //Class variables
  selected: 'sell' | 'manageSales' = 'manageSales';
  products: Product[];
  keyword = 'code'
  notFound = 'Artículo no encontrado'
  details: Product[] = [];
  total: number = 0;
  sales: Sale[];
  lastTicketNumber = 0
  
  

  //Manage sales variables
  columns: object[];
  rows = [];
  temp = [];
  SelectionType = SelectionType

  

  constructor(
    private productService: ProductService,
    private uiUtils: UiUtilsService,
    private salesService: SalesService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
  ) { }

  ionViewDidEnter(){
    this.columns = [
      {name: 'Ticket', prop: 'ticket'},
      {name: 'Fecha', prop: 'formattedDate'},
      {name: 'Pago', prop: 'payment'},
      {name: 'Total', prop: 'total', cellTemplate: this.totalTemplate}
    ]
  }

  ngOnInit() {
    this.getProducts();
    this.getSales();
  }


  getProducts(){
    this.productService.getProducts().subscribe(
      products => {
        this.products = products.filter(product => product.quantity > 0);
      }
    )
  }

  getSales(){
    this.salesService.getSales().subscribe(
      sales => {
        console.log(sales)
        sales.map(sale => {
          sale.formattedDate = moment(sale.date).locale('es').format('LLL')
        })
        this.sales = sales;
        this.rows = this.sales;
        this.temp = this.rows;
        if(sales.length === 0){
          this.lastTicketNumber = 1
        }else{
          this.lastTicketNumber = (sales[sales.length -1].ticket) + 1;
        }
      }
    )
  }

  onSelectedProduct(product){
    if(product.quantity === 0){
      this.uiUtils.showToast('Ya no cuentas con más unidades de este producto', 'danger', 'middle', 2000)
    }else{
      this.products.find(x => x.code === product.code).quantity = product.quantity - 1;
      this.details.push(product)
      this.total = this.total + this.products.find(x => x.code === product.code).price
      this.productAutocomplete.clear();
      this.productAutocomplete.close();
    }
  }

  removeDetail(product, index){
    this.products.find(x => x.code === product.code).quantity = product.quantity + 1;
    this.total = this.total - this.products.find(x => x.code === product.code).price
    this.details.splice(index, 1);
  }

  // Do printing...
  async print(saleInfo) {
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
      cmds += 'No. de ticket: '+this.lastTicketNumber;
      cmds += newLine;
      cmds += moment(saleInfo.date).locale('es').format('LLL');
      cmds += newLine+newLine;
      cmds += 'ID'+'     ';
      cmds += 'Producto';
      cmds += '   '+'Precio';
      cmds += newLine;
      for(var i=0;i<saleInfo.details.length;i++){
      cmds += parseInt(saleInfo.details[i].code)+'  -  ';
      cmds += JSON.stringify(saleInfo.details[i].name).substring(1,5);
      cmds += '  -  $'+JSON.stringify(saleInfo.details[i].price);
      cmds += newLine;
      }
      cmds += newLine + newLine;
      cmds += 'Metodo de pago: '+saleInfo.payment;
      cmds += newLine;
      cmds += esc + '!' + '\x16'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
      cmds += 'TOTAL: $'+ saleInfo.total;
      cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
      cmds += newLine + newLine;
      cmds += newLine+newLine+newLine+newLine;
  
      cpj.printerCommands = cmds;
  
      // Send print job to printer!
      cpj.sendToClient()
  }

  async purchase(){
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
              const saleInfo = {
                date,
                payment,
                details: this.details,
                total: this.total
              }

              const loading = await this.uiUtils.showLoadingPrefab();
              this.salesService.newSale(saleInfo).subscribe(
                res => {
                  this.uiUtils.showToast('Venta realizada con éxito', 'success', 'middle', 1500);
                  loading.dismiss();
                  this.details = []
                  this.total = 0
                  this.getProducts();
                  this.getSales();
                  this.print(saleInfo);
                },
                err => {
                  this.uiUtils.showToast(err.error.message, 'danger', 'middle', 1500);
                  loading.dismiss();
                }
              )
            }
          }
        }
      ]
    })

    alert.present();
  }

  async onSelectSale({selected}){
    const modal = await this.modalCtrl.create({
      component: SaleDetailsComponent,
      cssClass: 'details-modal',
      componentProps: {
        ticket: selected[0].ticket,
        total: selected[0].total,
        date: selected[0].date,
        sale: selected[0].payment
      }
    })

    modal.present();
    modal.onDidDismiss()
    .then(() => {
      this.getSales();
    });
  }
}
