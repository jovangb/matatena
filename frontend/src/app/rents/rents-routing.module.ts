import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RentsPage } from './rents.page';

const routes: Routes = [
  {
    path: '',
    component: RentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RentsPageRoutingModule {}
