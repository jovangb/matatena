import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ModalController } from '@ionic/angular';

//Components
import { ProductRegistrationModalComponent } from '../components/product-registration-modal/product-registration-modal.component';
import { ProductEditionModalComponent } from '../components/product-edition-modal/product-edition-modal.component';

//Services
import { ProductService } from '../services/product.service';

//Interfaces
import { Product } from '../interfaces/product';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('priceTemplate') priceTemplate: TemplateRef<any>;

  //Class variables
  products: Product[]

  //Table variables
  rows = [];
  columns: object[];
  temp = [];
  SelectionType = SelectionType

  constructor(
    private modalCtrl: ModalController,
    private productService: ProductService
  ) { }

  ionViewDidEnter(){
    this.columns = [
      {name: 'Código', prop: 'code'},
      {name: 'Nombre', prop: 'name'},
      {name: 'Tipo', prop: 'productType'},
      {name: 'Talla', prop: 'size'},
      {name: 'Cantidad', prop: 'quantity'},
      {name: 'Precio', prop: 'price', cellTemplate: this.priceTemplate},
      {name: 'Categoría', prop: 'productCategory'}
    ]
  }

  ngOnInit() {
    this.getProducts();
  }

  getRowClass = () => {

  }

  getProducts(){
    this.productService.getProducts().subscribe(products => {
      this.products = products;
      this.rows = this.products,
      this.temp = this.rows
    })
  }

  async addProducts(){
    const modal = await this.modalCtrl.create({
      component: ProductRegistrationModalComponent,
      backdropDismiss: false
    })

    modal.onDidDismiss()
    .then(registeredProducts => {
      if(registeredProducts) this.getProducts();
    })

    await modal.present();
  }

  updateFilter(event){
    const val = event.target.value.toLowerCase();

    //filter data
    const temp = this.temp.filter(function (d) {
      return d.code.toString().indexOf(val) !== -1 ||
      d.name.toLowerCase().indexOf(val) !== -1 ||
      d.productType.toLowerCase().indexOf(val) !== -1 ||
      d.size.toLowerCase().indexOf(val) !== -1 ||
      d.productCategory.toLowerCase().indexOf(val) !== -1 ||
      !val;
    });

    //update de rows
    this.rows = temp;

    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  async onSelectProduct({selected}){
    const modal = await this.modalCtrl.create({
      component: ProductEditionModalComponent,
      componentProps: {
        product: selected[0]
      },
      backdropDismiss: false
    })

    modal.onDidDismiss()
    .then(updatedProduct => {
      if(updatedProduct) this.getProducts();
    })

    await modal.present();
  }

}
