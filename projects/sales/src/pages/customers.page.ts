import {Component, OnInit} from '@angular/core';
import {DeviceInfoUtil} from '@smartstocktz/core-libs';
import {CreateCustomerComponent} from '../components/create-customer-form.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-customer-page',
  template: `
    <mat-sidenav-container>
      <mat-sidenav class="match-parent-side" #sidenav [mode]="enoughWidth()?'side': 'over'" [opened]="enoughWidth()">
        <app-drawer></app-drawer>
      </mat-sidenav>
      <mat-sidenav-content style="min-height: 100vh">
        <app-toolbar searchPlaceholder="" [showSearch]="false"
                     (searchCallback)="onSearch($event)" [heading]="'Customers'"
                     [sidenav]="sidenav"></app-toolbar>

        <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-10" style="padding: 16px 0">
          <div class="d-flex flex-row align-items-center justify-content-between pt-5">
            <h1>Customers</h1>
            <button (click)="addCustomer()" color="primary" mat-flat-button
                    class="m-2">
              Add Customer
            </button>
          </div>
          <app-customer-list></app-customer-list>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: []
})
export class CustomersPage extends DeviceInfoUtil implements OnInit {
  constructor(private readonly dialog: MatDialog) {
    super();

  }

  ngOnInit(): void {
  }

  onSearch($event: string): void {

  }

  addCustomer() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
