import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {CustomerModel} from '../models/customer.model';
import {MatSort} from '@angular/material/sort';
import {TransactionModel} from 'bfastjs/dist/models/TransactionModel';
import {MatPaginator} from '@angular/material/paginator';
import {CustomerState} from '../states/customer.state';
import {ReturnsModel} from '../models/returns.model';
import {DeviceState} from '@smartstocktz/core-libs';

// import {CustomerModel} from '@smartstocktz/core-libs/models/customer.model';

@Component({
  selector: 'app-customer-list',
  template: `
    <mat-progress-bar *ngIf="isLoading" mode="indeterminate" color="primary"></mat-progress-bar>
    <div class="d-flex flex-column justify-content-center" style="width: 100%;">
      <mat-card class="mat-elevation-z2">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Details</th>
            <td mat-cell *matCellDef="let row">
              <p><b>{{row.firstName}} {{row.secondName}}</b></p>
              <p>Mobile : {{ row.mobile ? row.mobile : row.phone }}</p>
              <p>Email : {{ row.email }}</p>
            </td>
            <td mat-footer-cell *matFooterCellDef></td>
          </ng-container>
          <ng-container matColumnDef="First Name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>First Name</th>
            <td mat-cell *matCellDef="let row"> {{row.firstName}} </td>
            <td mat-footer-cell *matFooterCellDef></td>
          </ng-container>
          <ng-container matColumnDef="Second Name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Second Name</th>
            <td mat-cell *matCellDef="let row"> {{row.secondName !== null ? row.secondName : ''}} </td>
            <!--<td mat-footer-cell *matFooterCellDef></td>-->
          </ng-container>
          <ng-container matColumnDef="Mobile">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Mobile</th>
            <td mat-cell *matCellDef="let row"> {{ row.mobile ? row.mobile : row.phone }} </td>
            <!--<td mat-footer-cell *matFooterCellDef>Total</td>-->
          </ng-container>
          <ng-container matColumnDef="Email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let row"> {{row.email}} </td>
            <!--<td mat-footer-cell *matFooterCellDef>{{getTotal()}}</td>-->
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="(deviceState.isSmallScreen | async)===true?displayColumnsMobile:displayColumns"></tr>
          <tr mat-row class="table-data-row"
              *matRowDef="let row; columns: (deviceState.isSmallScreen | async)===true?displayColumnsMobile:displayColumns;"></tr>
        </table>
      </mat-card>
      <app-data-not-ready *ngIf="noData && !isLoading"></app-data-not-ready>
      <!--      <mat-paginator *ngIf="!noData" [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>-->
    </div>
  `,
  styleUrls: []
})
export class CustomerListComponent implements OnInit {
  isLoading = true;
  noData = false;
  customers: CustomerModel[];
  dataSource: MatTableDataSource<CustomerModel>;

  displayColumns = ['First Name', 'Second Name', 'Mobile', 'Email'];
  displayColumnsMobile = ['details'];
  keysMap = {
    'First Name': 'firstName',
    'Second Name': 'secondName',
    Mobile: 'mobile',
    Email: 'email'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private readonly customerState: CustomerState,
              public readonly deviceState: DeviceState) {

  }

  ngOnInit(): void {
    this.initializeVariables();
    // this.transactionsState.loadingTransactions$.subscribe(value => {
    //   this.isLoading = value;
    // });
  }

  async initializeVariables() {
    this.customers = await this.customerState.getCustomersFromSource();
    this.customerState.customers$.subscribe(value => {
      this.customers = value;
      this.noData = (0 === this.customers.length);
      this.configureDataSource(this.customers);
    });
    this.customerState.loadingCustomers$.subscribe(
      loading => {
        this.isLoading = loading;
      }
    );
    this.configureDataSource(this.customers);
  }

  configureDataSource(customers) {
    this.dataSource = new MatTableDataSource(customers);
    // // console.log(this.dataSource.data);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (customer: CustomerModel, sortHeaderId: string) => {
      return customer[this.keysMap[sortHeaderId]];
    };
    this.dataSource.paginator = this.paginator;

  }

}
