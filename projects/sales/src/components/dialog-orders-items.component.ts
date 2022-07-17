import { Component, Inject, OnInit } from '@angular/core';
import { OrderModel } from '../models/order.model';
import { CartItemModel } from '../models/cart-item.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShopModel } from 'smartstock-core';

// @dynamic
@Component({
  selector: 'app-sale-orders-show-item',
  template: `
    <div style="padding: 16px" mat-dialog-content>
      <div class="order-header">
        <img [src]="data?.shop?.ecommerce?.logo" alt="logo" class="order-header-logo">
        <div class="order-header-text">
          <h1>{{data.order.channel==='profoma'?'PROFOMA INVOICE':'QUOTATION'}}</h1>
          <h4>Ref#: {{invoiceNumber(data.order.createdAt)}}</h4>
          <!-- <h4>Date: {{data.order.date}}</h4> -->
        </div>
      </div>
      <hr class="hrline">
      <div class='container-fluid row'>
        <div class="col-12 col-md-6 col-lg-6 col-xl-6">
          <h4><b>Bill from</b></h4>
          <h4>Name: {{data.shop?.businessName}}</h4>
          <h4>Street: {{data.shop.street}}</h4>
          <h4>City: {{data.shop.region}}, {{data.shop.country}}</h4>
          <!-- <h4>mobile: {{data.shop.region}}, {{data.shop.country}}</h4> -->
        </div>
        <div class="col-12  col-md-6 col-lg-6 col-xl-6">
          <h4><b>Bill to</b></h4>
          <h4>Name: {{data.order?.customer?.displayName}}</h4>
          <h4>Mobile: {{data.order?.customer?.phone}}</h4>
          <h4>Email: {{data.order?.customer?.email}}</h4>
        </div>
      </div>
      <!-- <hr class="hrline"> -->
      <div>
        <table class="table">
          <thead>
            <tr>
              <td class="otd">Item</td>
              <td class="otd">Quantity</td>
              <td class="otd">Price</td>
              <td class="otd">Total</td>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of data.order.items">
              <td class="otd">{{item.product.product}}</td>
              <td class="otd">{{item.quantity}}</td>
              <td class="otd">{{unitPrice(item)}}</td>
              <td class="otd">{{total(item)}}</td>
            </tr>
            <tr>
              <td class="otd"></td>
              <td class="otd"></td>
              <td class="otd"><b>TOTAL</b></td>
              <td class="otd">{{totalCost()}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div mat-dialog-actions class="oa">
        <button id="p_b" mat-button color='primary' (click)="printOrder()">Print</button>
    </div>
  `,
  styleUrls: ['../styles/order-info.scss']
})
export class OrdersItemsComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: {
    order: OrderModel,
    shop: ShopModel
  }) {
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

  invoiceNumber(date: string = '.T.'): any {
    const parts = date.split('T');
    const p1 = parts[0];
    const p2 = parts[1].replace(new RegExp('[^0-9]', 'ig'), '')
    return `${p1} ${p2}`;
  }

  unitPrice(item): any {
    if (this.data.order.channel === 'retail') return item?.product?.retailPrice;
    if (this.data.order.channel === 'whole') return item?.product?.wholesalePrice;
    if (this.data.order.channel === 'profoma') return item?.product?.retailPrice;
  }

  total(item): any {
    const unit = this.unitPrice(item);
    return typeof unit === 'number' ? unit * item.quantity : 0
  }
  totalCost() {
    return this.data.order.items.reduce((a, b) => a + this.unitPrice(b), 0);
  }

  printOrder(){
    document.getElementById('p_b').style.display ='none';
    const er = ()=>{
      document.getElementById('p_b').style.display ='block';
      window.removeEventListener('afterprint', er);
    }
    window.addEventListener('afterprint',er);
    window.print();
  }
}
