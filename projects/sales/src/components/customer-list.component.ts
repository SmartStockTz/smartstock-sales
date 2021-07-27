import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {CustomerModel} from '../models/customer.model';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CustomerState} from '../states/customer.state';
import {DeviceState} from '@smartstocktz/core-libs';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-customer-list',
  template: `
    <mat-progress-bar *ngIf="customerState.loadingCustomers | async" mode="indeterminate" color="primary"></mat-progress-bar>
    <table mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="details">
        <th class="table-title-text" mat-header-cell *matHeaderCellDef mat-sort-header>Details</th>
        <td class="table-body-text" mat-cell *matCellDef="let row">
          <p><b>{{row.firstName}} {{row.secondName}}</b></p>
          <p>Mobile : {{ row.mobile ? row.mobile : row.phone }}</p>
          <p>Email : {{ row.email }}</p>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>
      <ng-container matColumnDef="check">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>
          <mat-checkbox></mat-checkbox>
        </th>
        <td class="table-body-text" mat-cell *matCellDef="let row">
          <mat-checkbox></mat-checkbox>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>
      <ng-container matColumnDef="Name">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Name</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row.displayName}} </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>
      <ng-container matColumnDef="Mobile">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Mobile</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{ row.mobile ? row.mobile : row.phone }} </td>
        <!--<td mat-footer-cell *matFooterCellDef>Total</td>-->
      </ng-container>
      <ng-container matColumnDef="Email">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Email</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row.email}} </td>
        <!--<td mat-footer-cell *matFooterCellDef>{{getTotal()}}</td>-->
      </ng-container>
      <ng-container matColumnDef="Action">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Actions</th>
        <td class="table-body-text" mat-cell *matCellDef="let row">
          <button mat-icon-button>
            <mat-icon>more_horiz</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr class="customers-table-header" mat-header-row
          *matHeaderRowDef="(deviceState.isSmallScreen | async)===true?displayColumnsMobile:displayColumns"></tr>
      <tr mat-row class="table-data-row"
          *matRowDef="let row; columns: (deviceState.isSmallScreen | async)===true?displayColumnsMobile:displayColumns;"></tr>
    </table>
    <app-data-not-ready *ngIf="noData"></app-data-not-ready>
  `,
  styleUrls: ['../styles/customers-table.style.scss']
})
export class CustomerListComponent implements OnInit, OnDestroy, AfterViewInit {
  noData = false;
  customers: CustomerModel[];
  dataSource: MatTableDataSource<CustomerModel>;
  displayColumns = ['check', 'Name', 'Mobile', 'Email', 'Action'];
  displayColumnsMobile = ['details'];
  keysMap = {
    'First Name': 'firstName',
    'Second Name': 'secondName',
    Mobile: 'mobile',
    Email: 'email'
  };
  @Input() paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  destroyer: Subject<any> = new Subject<any>();

  constructor(public readonly customerState: CustomerState,
              public readonly deviceState: DeviceState) {
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }

  ngAfterViewInit(): void {
    this.configureDataSource();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource([]);
    this.customerState.fetchCustomers();
  }

  configureDataSource() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.customerState.customers.pipe(
      takeUntil(this.destroyer)
    ).subscribe(value => {
      this.dataSource.data = value;
    });
  }

}
