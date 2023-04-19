import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import moment from 'moment';
import { AlertController } from '@ionic/angular';
import { DatatableComponent } from '@swimlane/ngx-datatable';

//Interfaces
import { Product } from '../interfaces/product';
import { Rent } from '../interfaces/rent';

//Services
import { UiUtilsService } from '../services/ui-utils.service';
import { ProductService } from '../services/product.service';
import { RentService } from '../services/rent.service';

@Component({
  selector: 'app-rents',
  templateUrl: './rents.page.html',
  styleUrls: ['./rents.page.scss'],
})
export class RentsPage implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('productAutocomplete') productAutocomplete;
  @ViewChild('totalTemplate') totalTemplate: TemplateRef<any>;

  products: Product[];
  keyword = 'code'
  notFound = 'Artículo no encontrado'
  details: Product[] = [];
  rents: Rent[] = [];

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
    this.getProducts();
    this.getRents();
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
        },
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

              const alert = await this.alertCtrl.create({
                header: 'Depósito',
                inputs: [
                  {
                    type: 'number',
                    placeholder: 'Depósito',
                    name: 'deposit',
                  },
                ],
                buttons: [
                  {
                    text:  'Aceptar',
                    handler: async({deposit}) => {
                      if(!deposit){
                        return false;
                      }else{
                        const rentInfo = {
                          date,
                          payment,
                          deposit,
                          productCode: this.details[0].code,
                          total: this.total
                        }

                        const loading = await this.uiUtils.showLoadingPrefab();
                        this.rentService.newRent(rentInfo).subscribe(
                          res => {
                            this.uiUtils.showToast('Venta realizada con éxito', 'success', 'middle', 1500);
                            loading.dismiss();
                            this.details = []
                            this.total = 0
                            this.getProducts();
                            this.getRents();
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
          }
        }
      ]
    })

    alert.present();
  }

}
