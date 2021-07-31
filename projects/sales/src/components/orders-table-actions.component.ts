import {Component, OnInit} from '@angular/core';
import {OrderState} from '../states/order.state';

@Component({
  selector: 'app-orders-table-actions',
  template: `
    <div class="row">
      <button [disabled]="(orderState.getOrderFlag | async) === true" (click)="loadMore()" color="primary" mat-flat-button
              class="ft-button">
        Load More
      </button>
      <div style="margin: 5px"></div>
      <button [disabled]="(orderState.orderFilterKeyword | async) === ''" (click)="clearFilter()" color="primary" mat-button>
        <mat-icon>filter_alt</mat-icon>
        Clear Filter
      </button>
    </div>
  `
})
export class OrdersTableActionsComponent implements OnInit {

  constructor(public readonly orderState: OrderState) {
  }

  ngOnInit(): void {

  }

  loadMore() {
    this.orderState.getOrder();
  }

  clearFilter() {
    this.orderState.orderFilterKeyword.next('');
  }
}
