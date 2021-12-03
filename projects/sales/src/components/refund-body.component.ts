import {Component, OnInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-refund-body-component',
  template: `
    <app-refund-body-header-component (paginator)="gP($event)"></app-refund-body-header-component>
    <div class="refund-container">
      <app-refund-body-table-component *ngIf="paginator" [paginator]="paginator"></app-refund-body-table-component>
    </div>
  `,
  styleUrls: ['../styles/refund-body.style.scss']
})

export class RefundBodyComponent implements OnInit {
  paginator: MatPaginator;

  constructor() {
  }

  ngOnInit(): void {
  }

  gP($event: MatPaginator) {
    this.paginator = $event;
  }
}
