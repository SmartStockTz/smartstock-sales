import {Component} from '@angular/core';
import { DeviceInfoUtil } from '@smartstocktz/core-libs';
import {OrderState} from '../states/order.state';

@Component({
  selector: 'app-order-page',
  template: `
      <mat-sidenav-container>
          <mat-sidenav class="match-parent-side" #sidenav [mode]="enoughWidth()?'side': 'over'" [opened]="enoughWidth()">
              <app-drawer></app-drawer>
          </mat-sidenav>
          <mat-sidenav-content style="min-height: 100vh">
              <app-toolbar searchPlaceholder="Filter orders" [showSearch]="true"
                                  (searchCallback)="onSearch($event)" [heading]="'Orders'"
                                  [sidenav]="sidenav"></app-toolbar>
              <div class="container col-xl-8 col-lg-9 col-sm-10 col-md-10 col-11" style="padding: 16px 0">
                  <div style="height: 24px"></div>
                  <app-orders-table></app-orders-table>
              </div>
          </mat-sidenav-content>
      </mat-sidenav-container>
  `
})
export class OrderPage extends DeviceInfoUtil {
  constructor(private readonly orderState: OrderState) {
    super();
    document.title = 'SmartStock - Orders Sale';
  }

  onSearch($event: string): void {
    this.orderState.orderFilterKeyword.next($event);
  }
}
