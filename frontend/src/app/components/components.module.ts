import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';

//Components
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ProductRegistrationModalComponent } from './product-registration-modal/product-registration-modal.component';
import { ProductEditionModalComponent } from './product-edition-modal/product-edition-modal.component';
import { SaleDetailsComponent } from './sale-details/sale-details.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChangeDetailModalComponent } from './change-detail-modal/change-detail-modal.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { RentDetailModalComponent } from './rent-detail-modal/rent-detail-modal.component';
import { RentTicketModalComponent } from './rent-ticket-modal/rent-ticket-modal.component';


@NgModule({
  declarations: [
    MainMenuComponent,
    ProductRegistrationModalComponent,
    ProductEditionModalComponent,
    SaleDetailsComponent,
    ChangeDetailModalComponent,
    RentDetailModalComponent,
    RentTicketModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    AutocompleteLibModule,
    FullCalendarModule
  ],
  exports: [
    MainMenuComponent,
    ProductRegistrationModalComponent,
    ProductEditionModalComponent,
    SaleDetailsComponent,
    ChangeDetailModalComponent,
    RentDetailModalComponent,
    RentTicketModalComponent
  ]
})
export class ComponentsModule { }
