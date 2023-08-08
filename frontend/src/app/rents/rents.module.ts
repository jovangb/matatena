import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';

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
    NgxDatatableModule,
    FullCalendarModule
  ],
  declarations: [RentsPage]
})
export class RentsPageModule {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
