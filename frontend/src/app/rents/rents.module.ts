import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { IonicModule } from '@ionic/angular';

import { RentsPageRoutingModule } from './rents-routing.module';

import { RentsPage } from './rents.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RentsPageRoutingModule,
    AutocompleteLibModule,
    NgxDatatableModule
  ],
  declarations: [RentsPage]
})
export class RentsPageModule {}
