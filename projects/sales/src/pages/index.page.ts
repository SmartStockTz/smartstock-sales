import {Component, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-sales-index',
  template: `
    <app-layout-sidenav
      [heading]="'Sales'"
      [body]="body"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side': 'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      [leftDrawer]="side">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-12"
             style="padding: 16px 0; min-height: 100vh">

          <div *ngIf="(deviceState.isSmallScreen | async) === false" class="d-flex flex-wrap">
            <app-libs-rbac *ngFor="let page of pages" [groups]="page.rbac">
              <ng-template>
                <div routerLink="{{page.path}}" style="margin: 5px; cursor: pointer">
                  <mat-card matRipple class="index-item">
                    <mat-icon color="primary" style="font-size: 60px; height: 60px; width: 60px">
                      {{page.icon}}
                    </mat-icon>
                  </mat-card>
                  <p>{{page.name}}</p>
                </div>
              </ng-template>
            </app-libs-rbac>
          </div>

          <mat-nav-list *ngIf="(deviceState.isSmallScreen | async) === true">
            <div *ngFor="let page of pages">
              <mat-list-item routerLink="{{page.path}}">
                <mat-icon color="primary" matListIcon>{{page.icon}}</mat-icon>
                <h1 matLine>{{page.name}}</h1>
                <mat-card-subtitle matLine>{{page.detail}}</mat-card-subtitle>
                <mat-icon matSuffix>chevron_right</mat-icon>
              </mat-list-item>
              <mat-divider></mat-divider>
            </div>
          </mat-nav-list>

        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/index.style.scss']
})

export class IndexPage implements OnInit {
  pages = [
    {
      name: 'Retail',
      path: '/sale/retail',
      icon: 'receipt',
      detail: 'Cash sale in retail',
      rbac: ['*']
    },
    {
      name: 'Wholesale',
      path: '/sale/whole',
      icon: 'widgets',
      detail: 'Cash sale in wholesale',
      rbac: ['*']
    },
    {
      name: 'Invoices',
      path: '/sale/invoices',
      icon: 'payments',
      detail: 'Manage credit sale',
      rbac: ['*']
    },
    {
      name: 'Orders',
      path: '/sale/order',
      icon: 'local_shipping',
      detail: 'Manage online sales',
      rbac: ['*']
    },
    {
      name: 'Customers',
      path: '/sale/customers',
      icon: 'groups',
      detail: 'Manage your customers',
      rbac: ['*']
    },
    {
      name: 'Refunds',
      path: '/sale/refund',
      detail: 'Return sold products',
      icon: 'history',
      rbac: ['*']
    }
  ];

  constructor(public readonly deviceState: DeviceState) {
  }

  async ngOnInit(): Promise<void> {
  }

}
