import {Component, OnInit} from '@angular/core';
import {CreateCustomerComponent} from '../components/create-customer-form.component';
import {MatDialog} from '@angular/material/dialog';
import {DeviceState} from '@smartstocktz/core-libs';
import {CustomerState} from '../states/customer.state';
import {wrap} from 'comlink';

@Component({
  selector: 'app-customer-page',
  template: `
    <app-layout-sidenav searchPlaceholder=""
                        [heading]="'Customers'"
                        [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
                        [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
                        [body]="body"
                        backLink="/sale"
                        [hasBackRoute]="true"
                        [showSearch]="true"
                        (searchCallback)="onCustomerSearch($event)"
                        [leftDrawer]="side">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="customers-container">
          <div class="actions-container">
            <button (click)="addCustomer()" color="primary" mat-button>
              <mat-icon matPrefix>add</mat-icon>
              Add Customer
            </button>
            <span class="actions-spacer"></span>
            <mat-paginator #c_paginator></mat-paginator>
          </div>
          <app-customer-list [paginator]="c_paginator"></app-customer-list>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/customers-page.style.scss']
})
export class CustomersPage implements OnInit {
  constructor(private readonly dialog: MatDialog,
              public readonly customerState: CustomerState,
              public readonly deviceState: DeviceState) {
  }

  async ngOnInit(): Promise<void> {
  }

  async addCustomer(): Promise<any> {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      maxWidth: this.deviceState.isSmallScreen.value === true ? '100%' : '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onCustomerSearch(query: string) {
    if (!query || query === '') {
      this.customerState.fetchCustomers();
    } else {
      this.customerState.search(query);
    }
  }
}
