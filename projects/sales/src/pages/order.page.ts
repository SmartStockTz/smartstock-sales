import {Component, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {MatDialog} from '@angular/material/dialog';
import {CustomerState} from '../states/customer.state';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {OrderState} from '../states/order.state';
import {DialogNewOrderComponent} from '../components/dialog-new-order.component';

@Component({
  selector: 'app-order-page',
  template: `
    <app-layout-sidenav [heading]="'Orders'"
                        [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
                        [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
                        [body]="body"
                        backLink="/sale"
                        [hasBackRoute]="true"
                        [showSearch]="true"
                        searchPlaceholder="Type to filter"
                        [visibleMenu]="visibleMenu"
                        [hiddenMenu]="hiddenMenu"
                        (searchCallback)="onOrderSearch($event)"
                        [leftDrawer]="side">
      <ng-template #visibleMenu>
        <button (click)="addOrder()" color="primary" mat-icon-button>
          <mat-icon matPrefix>add</mat-icon>
        </button>
      </ng-template>
      <ng-template #hiddenMenu>
        <button (click)="hotReload()" mat-menu-item>
          <mat-icon matPrefix>refresh</mat-icon>
          Reload
        </button>
      </ng-template>
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div [class]="(deviceState.isSmallScreen | async)===true?'orders-container-mobile':'orders-container'">
          <div class="actions-container" *ngIf="(deviceState.isSmallScreen | async)===false">
            <button (click)="addOrder()" color="primary" mat-button>
              <mat-icon matPrefix>add</mat-icon>
              Add
            </button>
            <button (click)="hotReload()" color="primary" mat-button>
              <mat-icon matPrefix>refresh</mat-icon>
              Load
            </button>
            <span class="actions-spacer"></span>
            <!--            <div *ngIf="(deviceState.isSmallScreen | async)===false">-->
            <mat-paginator [ngStyle]="{display: (deviceState.isSmallScreen | async)===true?'none':''}" #c_paginator></mat-paginator>
            <!--            </div>-->
          </div>
          <app-order-list [paginator]="c_paginator"></app-order-list>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/orders-page.style.css']
})
export class OrderPage implements OnInit {
  constructor(private readonly dialog: MatDialog,
              public readonly orderState: OrderState,
              public readonly deviceState: DeviceState) {
  }

  async ngOnInit(): Promise<void> {
  }

  addOrder(): void {
    this.dialog.open(DialogNewOrderComponent, {
      closeOnNavigation: true
    });
  }

  onOrderSearch(query: string) {
    if (!query || query === '') {
      this.orderState.getOrders();
    } else {
      this.orderState.query(query);
    }
  }

  hotReload() {
    this.orderState.getOrdersRemote();
  }
}

