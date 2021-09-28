import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DeviceState} from '@smartstocktz/core-libs';
import {CustomerState} from '../states/customer.state';
import {DialogCreateCustomerComponent} from '../components/dialog-create-customer.component';
import {SheetCreateCustomerComponent} from '../components/sheet-create-customer.component';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-customer-page',
  template: `
    <app-layout-sidenav searchPlaceholder="Type to filter"
                        [heading]="'Customers'"
                        [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
                        [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
                        [body]="body"
                        backLink="/sale"
                        [hasBackRoute]="true"
                        [showSearch]="true"
                        [visibleMenu]="visibleMenu"
                        [hiddenMenu]="hiddenMenu"
                        (searchCallback)="onCustomerSearch($event)"
                        [leftDrawer]="side">
      <ng-template #visibleMenu>
        <button (click)="addCustomer()" color="primary" mat-icon-button>
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
        <app-customers-table-options *ngIf="(deviceState.isSmallScreen | async)===false"
                                     (pag)="setPaginator($event)">
        </app-customers-table-options>
        <app-customers-list *ngIf="(deviceState.isSmallScreen | async)===true"></app-customers-list>
        <app-customers-table *ngIf="(deviceState.isSmallScreen | async)===false && paginator" [paginator]="paginator">
        </app-customers-table>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/customers-page.style.css']
})
export class CustomersPage implements OnInit {
  paginator: MatPaginator;

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

  setPaginator($event: MatPaginator) {
    this.paginator = $event;
  }
}
