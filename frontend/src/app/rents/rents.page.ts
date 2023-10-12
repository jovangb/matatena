import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import moment from 'moment';
import { ModalController } from '@ionic/angular';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import {  JSPrintManager, InstalledPrinter, ClientPrintJob } from 'jsprintmanager';


//Interfaces
import { Product } from '../interfaces/product';
import { Rent } from '../interfaces/rent';

//Services
import { UiUtilsService } from '../services/ui-utils.service';
import { ProductService } from '../services/product.service';
import { RentService } from '../services/rent.service';
import { CalendarOptions } from '@fullcalendar/core';

//Components
import { RentDetailModalComponent } from '../components/rent-detail-modal/rent-detail-modal.component';
import { FullCalendarComponent } from '@fullcalendar/angular';


@Component({
  selector: 'app-rents',
  templateUrl: './rents.page.html',
  styleUrls: ['./rents.page.scss']
})
export class RentsPage implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('productAutocomplete') productAutocomplete;
  @ViewChild('totalTemplate') totalTemplate: TemplateRef<any>;
  @ViewChild('calendar') calendar: FullCalendarComponent;

  products: Product[];
  keyword = 'code'
  notFound = 'Artículo no encontrado'
  details: Product[] = [];
  rents: Rent[] = [];
  calendarEvents: EventInput[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [
      dayGridPlugin,
      timeGridPlugin, 
      interactionPlugin,
    ],
    initialView: 'dayGridMonth',
    locale: esLocale, //Adding Spanish
    timeZone: 'UTC',
  }

  //Manage rents variables
  columns: object[];
  rows = [];
  temp = [];
  rentsList: Rent[] = [];

  //Class variables
  selected: 'rent' | 'manageRents' = 'manageRents';
  total: number = 0;
  lastRentNumber = 0;


  constructor(
    private uiUtils: UiUtilsService,
    private productService: ProductService,
    private rentService: RentService,
    private modalCtrl: ModalController,
  ) { }

  ionViewDidEnter(){
    this.columns = [
      {name: 'Ticket', prop: 'ticket'},
      {name: 'Fecha', prop: 'formattedDate'},
      {name: 'Pago', prop: 'payment'},
      {name: 'Producto', prop: 'product.name'},
      {name: 'Déposito', prop: 'deposit', cellTemplate: this.totalTemplate},
      {name: 'Total', prop: 'total', cellTemplate: this.totalTemplate}
    ]
  }

  ngOnInit() {
    setTimeout( function() {
      window.dispatchEvent(new Event('resize'))
  },500)
    this.getRents();
    this.getProducts();
  }

  ngAfterViewInit() {
  }

  removeDetail(product, index){
    this.products.find(x => x.code === product.code).quantity = product.quantity + 1;
    this.total = this.total - this.products.find(x => x.code === product.code).price
    this.details.splice(index, 1);
  }

  getProducts(){
    this.productService.getProducts().subscribe(
      products => {
        this.products = products.filter(product => product.quantity > 0);
      }
    )
  }

  getRents(){
    this.rentService.getRents().subscribe(
      rents => {
        this.calendarEvents = [];
        this.rentsList = [];
        rents.map(rent => {
          rent.formattedDate = moment(rent.date).locale('es').format('LLL')
          this.rentsList.push(rent); 
        })
        this.rents = rents;
        this.rows = this.rents;
        this.temp = this.rows;

        if(rents.length === 0){
          this.lastRentNumber = 1
        }else{
          this.lastRentNumber = (rents[rents.length -1].ticket) + 1;
        }
        this.rentsList.forEach(
          rent => {
          let endDate = moment(rent.returning).add(1, 'day');
          this.calendarEvents.push({
            title: rent.product.name,
            start: rent.deliver,
            end: endDate.toISOString(),
            allDay: true
          });
        });
        console.log(this.calendarEvents)
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
    cmds += 'No. de ticket: '+this.lastRentNumber;
    cmds += newLine;
    cmds += saleInfo[0].createdAt;
    cmds += newLine+newLine;
    cmds += 'ID'+'     ';
    cmds += 'Producto';
    cmds += '   '+'Precio';
    cmds += newLine;
    for(var i=0;i<saleInfo.length;i++){
    cmds += JSON.stringify(saleInfo[i].code)+'  -  ';
    cmds += JSON.stringify(saleInfo[i].name).substring(1,5);
    cmds += '  -  $'+JSON.stringify(saleInfo[i].price);
    cmds += newLine;
    }
    cmds += newLine + newLine;
    cmds += 'Renta';
    cmds += newLine;
    cmds += esc + '!' + '\x16'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
    cmds += 'TOTAL: $'+ total;
    cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
    cmds += newLine + newLine;
    cmds += newLine+newLine+newLine+newLine;

    cpj.printerCommands = cmds;

    // Send print job to printer!
    cpj.sendToClient()
}


  async rent(){
    const modal = await this.modalCtrl.create({
      component: RentDetailModalComponent,
      componentProps:{
        details: this.details,
        total: this.total
      }
    })

    modal.present()
    modal.onDidDismiss()
    .then(() => {
      this.calendarEvents = [];
      this.getRents();
      this.print(this.details, this.total);
    });
  }

}
