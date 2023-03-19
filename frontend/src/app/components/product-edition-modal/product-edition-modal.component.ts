import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';

//Interfaces
import { Product } from 'src/app/interfaces/product';

//Services
import { UiUtilsService } from 'src/app/services/ui-utils.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-edition-modal',
  templateUrl: './product-edition-modal.component.html',
  styleUrls: ['./product-edition-modal.component.scss'],
})
export class ProductEditionModalComponent implements OnInit {
  @Input('product') product: Product;
  updatedProduct: boolean = false;
  productForm: FormGroup
  edit: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private uiUtils: UiUtilsService,
    private productService: ProductService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.productForm =  new FormGroup({
      code: new FormControl({value: this.product.code, disabled: true}, Validators.required),
      name: new FormControl({value: this.product.name, disabled: true}, Validators.required),
      productType: new FormControl({value: this.product.productType, disabled: true}),
      size: new FormControl({value: this.product.size, disabled: true}),
      quantity: new FormControl({value: this.product.quantity, disabled: true}),
      price: new FormControl({value: this.product.price, disabled: true}, Validators.required),
      productCategory: new FormControl({value: this.product.productCategory, disabled: true})
    })
  }

  async editProduct(){
    console.log(this.productForm.invalid)
    const { code, name, productType, size, quantity, price, productCategory } = this.productForm.value;
    const updatedData = {
      code,
      name,
      size,
      productType,
      quantity,
      price,
      productCategory,
    }

    const loading = await this.uiUtils.showLoadingPrefab();

    this.productService.editProduct(this.product.code, updatedData).subscribe(
      () => {
        loading.dismiss();
        this.updatedProduct = true;
        this.uiUtils.showToast('Producto actualizado', 'success', 'middle', 1500);
        this.onCancel();
      },
      err => {
        loading.dismiss();
        this.uiUtils.showToast(err.error.message, 'danger', 'middle', 1500);
      }
    )
  }

  onCancelEdition(){
    this.edit = false;
    this.productForm =  new FormGroup({
      code: new FormControl({value: this.product.code, disabled: true}, Validators.required),
      name: new FormControl({value: this.product.name, disabled: true}, Validators.required),
      productType: new FormControl({value: this.product.productType, disabled: true}),
      size: new FormControl({value: this.product.size, disabled: true}),
      quantity: new FormControl({value: this.product.quantity, disabled: true}),
      price: new FormControl({value: this.product.price, disabled: true}, Validators.required),
      productCategory: new FormControl({value: this.product.productCategory, disabled: true})
    })
  }

  onEditProduct(){
    this.edit = true;
    this.productForm.enable();
  }

  async onDeleteProduct(){
    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: '¿Está seguro de eliminar el producto?',
      buttons:[
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          role: 'accept',
          handler: () => {
            this.productService.deleteProduct(this.product.code).subscribe(
              () => {
                this.uiUtils.showToast('Producto eliminado', 'success', 'middle', 1500)
                this.updatedProduct = true;
                this.onCancel();
              },
              err => {
                this.uiUtils.showToast(err.error.message, 'danger', 'middle', 2500)
              }
            )
          },
        }
      ]
    })

    await alert.present();
  }

  onCancel(){
    this.modalCtrl.dismiss(this.updatedProduct);
  }

}
