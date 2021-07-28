import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DeviceState} from '@smartstocktz/core-libs';
import {CustomerState} from '../states/customer.state';
import {DialogCreateCustomerComponent} from '../components/dialog-create-customer.component';
import {SheetCreateCustomerComponent} from '../components/sheet-create-customer.component';
import {MatBottomSheet} from '@angular/material/bottom-sheet';

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
        <div [class]="(deviceState.isSmallScreen | async)===true?'customers-container-mobile':'customers-container'">
          <div class="actions-container">
            <button (click)="addCustomer()" color="primary" mat-button>
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
          <app-customer-list
            [paginator]="c_paginator"></app-customer-list>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/customers-page.style.scss']
})
export class CustomersPage implements OnInit {
  constructor(private readonly dialog: MatDialog,
              public readonly customerState: CustomerState,
              public readonly matBottomSheet: MatBottomSheet,
              public readonly deviceState: DeviceState) {
  }

  async ngOnInit(): Promise<void> {
  }

  addCustomer(): void {
    if (this.deviceState.isSmallScreen.value === true) {
      this.matBottomSheet.open(SheetCreateCustomerComponent, {
        data: {},
        closeOnNavigation: true
      });
      return;
    }
    const dialogRef = this.dialog.open(DialogCreateCustomerComponent, {
      maxWidth: '500px'
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

  hotReload() {
    this.customerState.hotFetchCustomers();
  }
}
