import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

//Interfaces
import { Product } from 'src/app/interfaces/product';
import { ProductXlsxData } from 'src/app/interfaces/excel-data';

//Services
import { XlsxService } from 'src/app/services/xlsx.service'
import { UiUtilsService } from 'src/app/services/ui-utils.service'
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-registration-modal',
  templateUrl: './product-registration-modal.component.html',
  styleUrls: ['./product-registration-modal.component.scss'],
})
export class ProductRegistrationModalComponent implements OnInit {

  //Class variables
  newProducts: Product[] = [];
  registeredProducts: boolean = false;
  productForm: FormGroup
  excelFile: boolean;

  constructor(
    private modalCtrl: ModalController,
    private xlsxService: XlsxService,
    private uiUtils: UiUtilsService,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.productForm =  new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      productType: new FormControl(''),
      size: new FormControl(''),
      quantity: new FormControl(''),
      price: new FormControl('', Validators.required),
      productCategory: new FormControl('')
    })
  }

  addProduct(){
    if(this.productForm.invalid) this.uiUtils.showToast("Formulario inválido, revisa todos los campos", 'danger', 'middle', 2000);
    else{
      this.newProducts.push(this.productForm.value);
      this.submitNewProducts();
    }
  }

  async submitNewProducts(){
    const loading = await this.uiUtils.showLoadingPrefab();
    this.productService.addProducts(this.newProducts).subscribe(notUploadedProducts => {
      if(this.excelFile === true) this.excelFile = false;
      this.newProducts = [];
      loading.dismiss();
      if(notUploadedProducts.length > 0){
        let message: string = '';
        notUploadedProducts.map(notUploadedProduct => message += `<li>${notUploadedProduct.name}</li>`)
        this.uiUtils.showAlert("Productos no agregados", `Los siguientes productos no se pudieron agregar <br> <ul>${message}</ul>`)
        this.productForm.enable();
      }else{
        this.registeredProducts = true;
        this.uiUtils.showToast("Producto(s) agregado(s)", 'success', 'middle', 1500);
        this.productForm.reset();
      }
    },
    err => {
      loading.dismiss();
      this.uiUtils.showAlert("Error", "Tenemos problemas con la solicitud, inténtalo de nuevo más tarde");
    })
  }

  onCancel(){
    this.modalCtrl.dismiss(this.registeredProducts);
  }

  async downloadTemplate(){
    const loading = await this.uiUtils.showLoadingPrefab();
    this.xlsxService.generateFileTemplate(['code', 'name', 'productType', 'size', 'quantity', 'price', 'productCategory'], 'Productos')
    loading.dismiss();
  }

  async onReadExcelFile(event: any){
    const excelFile = event.target.files[0];

    const fileData = await this.xlsxService.readFileAsync<ProductXlsxData>(excelFile, ['code', 'name', 'productType', 'size', 'quantity', 'price', 'productCategory']);

    if(!fileData) return;

    //Validate data
    const invalidRowIndex = fileData.findIndex(
      ({code, name, quantity, price}) =>  !code || !name || !quantity || !price
    );

    if(invalidRowIndex > 0){
      const errorAlertMessage = "La fila <<ROW_NUMBER>> es invalida, favor de revisar el archivo XLSX.".replace(
        '<<ROW_NUMBER>>',
        `${invalidRowIndex + 2}`
      );

      this.uiUtils.showAlert("Error en el archivo XLSX", errorAlertMessage);
      return;
    }

    this.productForm.disable();
    this.excelFile = true;

    const successToastMessage = "XLSX aceptado. <<ELEMENTS>> elementos fueron cargados.".replace(
      '<<ELEMENTS>>',
      `${fileData.length}`
    );

    this.uiUtils.showToast(successToastMessage, 'success', 'middle', 2000);

    this.newProducts = fileData;
  }

  onDeleteNewProducts(){
    this.newProducts = [];
    this.excelFile = false;
    this.productForm.enable();
  }

}
