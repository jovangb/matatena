import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import moment from 'moment';
import { AlertController, ModalController } from '@ionic/angular';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';




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

  //Class variables
  selected: 'rent' | 'manageRents' = 'manageRents';
  total: number = 0;
  lastRentNumber = 0;

  constructor(
    private uiUtils: UiUtilsService,
    private productService: ProductService,
    private rentService: RentService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
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
  },300)
    this.getProducts();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getRents();
    }, 300);
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
    let calendarApi = this.calendar.getApi();
    this.rentService.getRents().subscribe(
      rents => {
        rents.map(rent => {
          rent.formattedDate = moment(rent.date).locale('es').format('LLL')
        })
        this.rents = rents;
        this.rows = this.rents;
        this.temp = this.rows;

        if(rents.length === 0){
          this.lastRentNumber = 1
        }else{
          this.lastRentNumber = (rents[rents.length -1].ticket) + 1;
          console.log(rents)
          for (const rent of rents) {
            let endDate = moment(rent.returning).add(1, 'day');//Adding 1 Day Code
            
            calendarApi.addEvent({
              title: `${rent.product.name}`,
              start: rent.deliver,
              end: endDate.toISOString(), //Adding 1 Day Code
              allDay: true
            })
            console.log(rent.deliver);
            console.log(rent.returning);
          }
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

  async rent(){
    const modal = await this.modalCtrl.create({
      component: RentDetailModalComponent,
      componentProps:{
        details: this.details,
        total: this.total
      }
    })

    modal.present()
  }

}
