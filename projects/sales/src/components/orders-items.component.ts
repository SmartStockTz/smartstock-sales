import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {OrderModel} from '../models/order.model';
import {CartItemModel} from '../models/cart-item.model';

// @dynamic
@Component({
  selector: 'app-sale-orders-show-item',
  template: `
    <div style="padding: 16px 0 24px 0;">
      <div>
        <h3>{{data.order?.customer?.displayName}} order Items</h3>
      </div>
      <mat-divider></mat-divider>
      <mat-list>
        <mat-list-item *ngFor="let cart of data.order.items;let i=index">
          <div matListIcon>
            {{i + 1}}
          </div>
          <p matLine>{{cart.product.product}} @ {{price(data.order, cart) | number}}</p>
          <p matLine>Quantity : {{cart.quantity}}</p>
        </mat-list-item>
      </mat-list>
      <mat-divider></mat-divider>
<!--      <div style="padding: 8px 0 16px 0">-->
<!--        <p>Ship to</p>-->
<!--        <h3>{{data.order?.shipping?.location}}</h3>-->
<!--      </div>-->
      <div style="padding: 8px 0 16px 0">
<!--        <p>Total</p>-->
        <h3>{{data.order.total | fedha | async}}</h3>
      </div>
    </div>
  `
})
export class OrdersItemsComponent implements OnInit {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) readonly data: { order: OrderModel }) {
  }

  ngOnInit(): void {
  }

  price(order: OrderModel, cart: CartItemModel) {
    switch (order.channel) {
      case 'retail':
        return cart.quantity * cart.product.retailPrice;
      case 'whole':
        return cart.quantity * cart.product.wholesalePrice;
      default:
        return cart.quantity * cart.product.retailPrice;
    }
  }
}
