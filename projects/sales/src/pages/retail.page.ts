import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-retail-page',
  template: `
    <app-sale [isViewedInWholesale]="false"></app-sale>
  `,
  styleUrls: ['../styles/retail.style.css']
})
export class RetailPageComponent implements OnInit {
  constructor() {
    document.title = 'SmartStock - Retail Sale';
  }

  ngOnInit() {
  }
}
