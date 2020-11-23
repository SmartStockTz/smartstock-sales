import { Component, OnInit } from '@angular/core';
import { DeviceInfoUtil } from '@smartstocktz/core-libs';

@Component({
    template: `
         <mat-sidenav-container>
          <mat-sidenav class="match-parent-side" #sidenav [mode]="enoughWidth()?'side': 'over'" [opened]="enoughWidth()">
              <smartstock-drawer></smartstock-drawer>
          </mat-sidenav>
          <mat-sidenav-content style="min-height: 100vh">
              <smartstock-toolbar searchPlaceholder="Filter orders" [showSearch]="false"
                                  (searchCallback)="onSearch($event)" [heading]="'Pay by Invoice'"
                                  [sidenav]="sidenav"></smartstock-toolbar>
                                  
                                  <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-10" style="padding: 16px 0">
                  <h1>Go To</h1>
                  <div class="row">
                      <div *ngFor="let page of pages" routerLink="{{page.path}}" style="margin: 5px; cursor: pointer">
                          <mat-card matRipple
                                    style="width: 150px; height: 150px; display: flex; justify-content: center; align-items: center; flex-direction: column">
                              <mat-icon color="primary" style="font-size: 60px; height: 60px; width: 60px">
                                  {{page.icon}}
                              </mat-icon>
                          </mat-card>
                          <p>{{page.name}}</p>
                      </div>
                  </div>
              </div>
          </mat-sidenav-content>
      </mat-sidenav-container>
    `,
    selector: 'smartstock-pay-by-credit'
})
export class PayByCreditPageComponent extends DeviceInfoUtil implements OnInit {
    ngOnInit() {

    }

    onSearch($event: string): void {

    }

    pages = [
        {
            name: 'Sell',
            path: '/sale/invoice',
            icon: 'shop'
        },
        {
            name: 'Invoices',
            path: '/sale/list_invoices',
            icon: 'receipt'
        },
        {
            name: 'Customers',
            path: '/sale/list_customers',
            icon: 'person'
        },

    ]
}