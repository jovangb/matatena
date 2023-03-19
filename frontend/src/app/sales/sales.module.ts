import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { IonicModule } from '@ionic/angular';

import { SalesPageRoutingModule } from './sales-routing.module';

import { SalesPage } from './sales.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SalesPageRoutingModule,
    AutocompleteLibModule,
    NgxDatatableModule
  ],
  declarations: [SalesPage]
})
export class SalesPageModule {}
