import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {OrderModel} from '../models/order.model';
import {OrderState} from '../states/order.state';
import {OrdersTableShowItemsComponent} from './orders-table-show-items.component';
import {MatSnackBar} from '@angular/material/snack-bar';

// @dynamic
@Component({
  selector: 'app-orders-table-options',
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
        <mat-list-item  (click)="cancelOrder()">
          <mat-icon *ngIf="data.order.status ==='CANCELLED'" matListIcon>refresh</mat-icon>
          <mat-icon *ngIf="data.order.status !=='CANCELLED'" matListIcon>cancel</mat-icon>
          <p matLine>{{data.order.status !=='CANCELLED' ? "Cancel Order" : "Re-Open Order"}}</p>
          <!--<mat-card-subtitle matLine>Mark order as complete</mat-card-subtitle>-->
        </mat-list-item>
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
              private snack: MatSnackBar,
              @Inject(MAT_BOTTOM_SHEET_DATA) public readonly data: { order: OrderModel }) {
  }

  ngOnInit(): void {
  }

  showItems(): void {
    this.bottomSheetRef.dismiss(this.data.order);
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

  cancelOrder() {
    if (this.data.order && this.data.order.status !== 'CANCELLED'){
      this.orderState.markOrderAsCancelled(this.data.order).then(val => {
        this.data.order = val;
        this.snack.open('Order is cancelled', 'Ok', {
            duration: 3000
          }
        );
        this.bottomSheetRef.dismiss(val);
      }).catch(err => {
        console.warn(err)
        this.snack.open('Cancelling is unsuccessful please try again', 'Ok', {
          duration: 3000
        });
      });
    } else {
      this.orderState.markAsProcessed(this.data.order).then(val => {
        this.data.order = val;
        this.snack.open('Order is reopened', 'Ok', {
            duration: 3000
          }
        );
        this.bottomSheetRef.dismiss(val);
      }).catch(err => {
        console.warn(err)
        this.snack.open('Reopening order is unsuccessful please try again', 'Ok', {
          duration: 3000
        });
      });
    }
  }
}
