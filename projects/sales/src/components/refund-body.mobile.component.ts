import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-refund-body-mobile-component',
  template: `
    <div class="refund-container-mobile">
      <app-refund-body-header-mobile-component></app-refund-body-header-mobile-component>
      <app-refund-body-list-mobile-component></app-refund-body-list-mobile-component>
    </div>
  `,
  styleUrls: ['../styles/refund-body.style.scss']
})

export class RefundBodyMobileComponent implements OnInit{
  constructor() {
  }

  ngOnInit(): void {
  }
}
