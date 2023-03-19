import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

//Components
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ProductRegistrationModalComponent } from './product-registration-modal/product-registration-modal.component';
import { ProductEditionModalComponent } from './product-edition-modal/product-edition-modal.component';
import { SaleDetailsComponent } from './sale-details/sale-details.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChangeDetailModalComponent } from './change-detail-modal/change-detail-modal.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';


@NgModule({
  declarations: [
    MainMenuComponent,
    ProductRegistrationModalComponent,
    ProductEditionModalComponent,
    SaleDetailsComponent,
    ChangeDetailModalComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    AutocompleteLibModule
  ],
  exports: [
    MainMenuComponent,
    ProductRegistrationModalComponent,
    ProductEditionModalComponent,
    SaleDetailsComponent,
    ChangeDetailModalComponent
  ]
})
export class ComponentsModule { }
