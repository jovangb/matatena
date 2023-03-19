import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RentsPageRoutingModule } from './rents-routing.module';

import { RentsPage } from './rents.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RentsPageRoutingModule
  ],
  declarations: [RentsPage]
})
export class RentsPageModule {}
