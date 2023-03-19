import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

//Interfaces
import { Product } from 'src/app/interfaces/product';

//Service
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-change-detail-modal',
  templateUrl: './change-detail-modal.component.html',
  styleUrls: ['./change-detail-modal.component.scss'],
})
export class ChangeDetailModalComponent implements OnInit {
  products: Product[] = [];
  notFound = 'Artículo no encontrado'
  keyword = 'placeholder'
  selectedProduct: Product;

  constructor(
    private productService: ProductService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.getProducts();
  }

  getProducts(){
    this.productService.getProducts().subscribe(
      products => {
        products.map(product => {
          product.placeholder = `(${product.code}) -  ${product.name}`
        })

        this.products = products;
      }
    )
  }

  onSelectProduct(product){
    this.selectedProduct = product;
  }

  confirmChange(){
    this.modalCtrl.dismiss(this.selectedProduct);
  }

}
