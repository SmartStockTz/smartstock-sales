import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-whole-page',
  template: `
    <app-sale [isViewedInWholesale]="true"></app-sale>
  `,
  styleUrls: ['../styles/whole.style.css'],
})
export class WholePageComponent implements OnInit {

  constructor() {
    document.title = 'SmartStock - Wholesale Sale';
  }

  ngOnInit() {
  }
}
