import {Component, OnInit} from '@angular/core';
import {CreateCustomerComponent} from '../components/create-customer-form.component';
import {MatDialog} from '@angular/material/dialog';
import {DeviceState} from '@smartstocktz/core-libs';

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
                        [leftDrawer]="side">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container col-xl-9 col-lg-9 col-sm-10 col-md-10 col-sm-12 col-12 pt-3" style="min-height: 100vh">
          <div class="d-flex flex-row align-items-center justify-content-between">
            <button (click)="addCustomer()" color="primary" mat-flat-button
                    class="m-2">
              Add Customer
            </button>
          </div>
          <app-customer-list></app-customer-list>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: []
})
export class CustomersPage implements OnInit {
  constructor(private readonly dialog: MatDialog,
              public readonly deviceState: DeviceState) {
  }

  async ngOnInit(): Promise<void> {
  }

  async onSearch($event: string): Promise<void> {

  }

  async addCustomer(): Promise<any> {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      // height: '400px',
      // width: '600px',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
