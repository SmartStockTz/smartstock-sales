import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {OrderModel} from '../models/order.model';
import {OrderState} from '../states/order.state';
import {OrdersTableShowItemsComponent} from './orders-table-show-items.component';

// @dynamic
@Component({
  selector: 'smartstock-orders-table-options',
  template: `
    <div style="padding: 16px 0 24px 0;">
      <mat-nav-list>
        <div *ngIf="data.order.status ==='PROCESSED' ">
          <mat-list-item *ngIf="(orderState.markAsCompleteFlag | async) === false" (click)="markAsComplete()">
            <mat-icon matListIcon>done_all</mat-icon>
            <p matLine>Mark As Complete</p>
            <mat-card-subtitle matLine>Mark order as complete</mat-card-subtitle>
          </mat-list-item>
          <mat-progress-spinner *ngIf="(orderState.markAsCompleteFlag | async) === true" diameter="30"
                                mode="indeterminate"></mat-progress-spinner>
        </div>
        <mat-list-item (click)="showItems()">
          <mat-icon matListIcon>receipt</mat-icon>
          <p matLine>Show Items</p>
          <mat-card-subtitle matLine>See orders items</mat-card-subtitle>
        </mat-list-item>
        <mat-list-item>
          <mat-icon matListIcon>print</mat-icon>
          <p matLine>Print Order</p>
          <mat-card-subtitle matLine>Get order in PDF</mat-card-subtitle>
        </mat-list-item>
      </mat-nav-list>
    </div>    `
})
export class OrdersTableOptionsComponent implements OnInit {
  constructor(private readonly bottomSheetRef: MatBottomSheetRef<OrdersTableOptionsComponent>,
              private readonly bottomSheet: MatBottomSheet,
              public readonly orderState: OrderState,
              @Inject(MAT_BOTTOM_SHEET_DATA) public readonly data: { order: OrderModel }) {
  }

  ngOnInit(): void {
  }

  showItems(): void {
    this.bottomSheetRef.dismiss(true);
    this.bottomSheet.open(OrdersTableShowItemsComponent, {
      data: {
        order: this.data.order
      },
      closeOnNavigation: true
    });
  }

  markAsComplete(): void {
    this.orderState.markAsComplete(this.data.order);
  }
}
