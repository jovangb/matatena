import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  imageUrl: string;

  ngOnInit(){
    const basePath = window.location.href;
    console.log(window.location.href)
    this.imageUrl = `${basePath}/assets/img/sales.svg`;
  }

  constructor() {}
}
