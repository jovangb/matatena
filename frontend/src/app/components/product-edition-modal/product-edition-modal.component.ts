import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as JsBarcode from 'jsbarcode';
// const vfs = pdfMake.vfs;
// const robotoItalicPath = vfs['Roboto-Italic.ttf'];

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

  async onTaggingProduct(){
    const alerta = await this.alertCtrl.create({
      header: 'Copias',
      inputs: [
          {
              type: 'number',
              name: 'quantity'
          }
      ],
      buttons: [
          {
              text: 'Aceptar',
              handler: async (data) => {
                  const quantity = parseFloat(data.quantity); // Convierte el valor ingresado a un número
                  if (!isNaN(quantity)) {
                      const productcode = this.product.code;
                      const productname = this.product.name;
                      const productsize = this.product.size.toString();
                      await this.generateBarcodePDF(productcode, quantity, productname, productsize);
                  } else {
                      console.log("Cantidad inválida");
                  }
              }
          },
      ],
  });

  alerta.present();
  }

  generateBarcodePDF(productCode: number, quantity: number, productname: string, productsize: string) {
    pdfMake.fonts = {
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
      }
    }
    try {
      
      // Creating CodeBar
      const barcodeCanvas = document.createElement('canvas');
      JsBarcode(barcodeCanvas, productCode.toString(), {
        format: 'CODE128',
        displayValue: false,
      });

      // Codebar to image
      const barcodeImageUrl = barcodeCanvas.toDataURL('image/png');

      var content = [  
        { text: this.product.code , fontSize: 12, alignment: 'left', margin: [20, 0, 0, 0]},
        {
          image: barcodeImageUrl,
          width: 220,
          height: 100,
          alignment: 'left',
          margin: [0, 0, 0, 0]
        },
        { text: `${productname} - ${productsize}` , fontSize: 12, alignment: 'left', margin: [20, 0, 0, 40]},
        
      ]
      var customPageSize = { width: 216, height: 144 };

      // Creating PDF 
      const docDefinition = {
        pageSize: customPageSize,
        content: [

        ],
        
        defaultStyle:{
          fonts: 'Roboto'
        },
        pageMargins: [0, 0, 0, 0],
      };
      
      for (var i = 0; i < quantity; i++){
        docDefinition.content = docDefinition.content.concat(JSON.parse(JSON.stringify(content)));
      }


      this.printPDF(docDefinition, quantity);
    } catch (error) {
      console.error('Error al generar el código de barras y el PDF:', error);
    }
  }

  printPDF(docDefinition, quantity) {
    try {
      const pdfDocument = pdfMake.createPdf(docDefinition);
      pdfDocument.getBuffer((buffer) => {
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.contentWindow.print();

      });
    } catch (error) {
      console.error('Error al imprimir el PDF:', error);
    }
  }

}

