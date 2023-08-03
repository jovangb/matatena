import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import moment from 'moment';

//Services
import { UiUtilsService } from 'src/app/services/ui-utils.service';
import { ChangeDetailModalComponent } from '../change-detail-modal/change-detail-modal.component';
import { SalesService } from 'src/app/services/sales.service';

@Component({
  selector: 'app-sale-details',
  templateUrl: './sale-details.component.html',
  styleUrls: ['./sale-details.component.scss'],
})
export class SaleDetailsComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('priceTemplate') priceTemplate: TemplateRef<any>;
  @Input('details') details: any[];
  @Input('changes') changes: any[];
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

  constructor(
    private modalCtrl: ModalController,
    private uiUtils: UiUtilsService,
    private alertCtrl: AlertController,
    private salesService: SalesService
  ) { }

  ionViewDidEnter(){
    this.columns = [
      {name: 'Código', prop: 'code'},
      {name: 'Producto', prop: 'product'},
      {name: 'Talla', prop: 'size'},
      {name: 'Precio', prop: 'price', cellTemplate: this.priceTemplate}
    ]
  }

  ngOnInit() {
    this.changes = this.changes.map(({change_details, date}) => {
      return {
        date: moment(date).locale('es').format('L'),
        changes: change_details.map(change => {
          return {
            oldDetail: {
              code: change.sale_detail.product.code,
              product: change.sale_detail.product.name,
              price: change.sale_detail.product.price
            },
            newDetail: {
              code: change.product.code,
              product: change.product.name,
              price: change.product.price
            },
            difference: change.difference
          }
        })
      }
    })

    console.log(this.changes);

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

    if(moment().diff(moment(this.date).format(), 'days') <= 7){
      this.changeAvailable = true
    }else{
      this.changeAvailable = false
    }
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

}
