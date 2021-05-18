import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CustomerState} from '../states/customer.state';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ReturnsState} from '../states/returns.state';
import {SalesReportsState} from '../states/sales-reports.state';
import {SalesModel} from '../models/sale.model';
import bfast from 'bfastjs';
import {StorageService, toSqlDate} from '@smartstocktz/core-libs';
import {PeriodState} from '../states/period.state';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  template: `
    <div class="row" mat-dialog-content>
      <div>
        <mat-card-title>Create Return</mat-card-title>
        <div class="row m-0 justify-content-end">
          <mat-form-field appearance="outline">
            <mat-label>Filter</mat-label>
            <input matInput [formControl]="filterFormControl" placeholder="type here ...">
          </mat-form-field>
          <app-period-date-range [hidePeriod]="true"></app-period-date-range>
        </div>
      </div>
      <div class="flex-fill">

        <mat-progress-bar *ngIf="isLoading" mode="indeterminate" color="primary"></mat-progress-bar>
        <div class="mat-elevation-z8 d-flex flex-fill flex-column justify-content-center " style="width: 100%; height: 100%">
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="Channel">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Channel</th>
              <td mat-cell *matCellDef="let element">{{element.channel}}</td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="Product">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Product</th>
              <td mat-cell *matCellDef="let element">{{element.product}}</td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="Total Amount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Amount</th>
              <td mat-cell *matCellDef="let element">{{element.amount}}</td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="Total Items">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Items</th>
              <td mat-cell *matCellDef="let element">{{element.quantity}}</td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="Customer">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
              <td mat-cell
                  *matCellDef="let element">{{element.customer !== null ? element.customer : 'N/A'}} </td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="Seller">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Seller</th>
              <td mat-cell
                  *matCellDef="let element">{{element.sellerObject != null ? ((element.sellerObject.firstname | titlecase) + " " + element.sellerObject.lastname | titlecase) : element.seller}} </td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="Date of Sale">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date of Sale</th>
              <td mat-cell *matCellDef="let element">{{element.date}} </td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="Actions">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Action</th>
              <td mat-cell *matCellDef="let element">
                <button class="btn-block" color="primary" (click)="returnSale(element)" mat-raised-button>Return</button>
              </td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayColumns"></tr>
            <tr mat-row class="table-data-row"
                *matRowDef="let row; columns: displayColumns;"></tr>
            <!--<tr mat-footer-row *matFooterRowDef="displayColumns; sticky: true"></tr>-->
          </table>
          <app-data-not-ready *ngIf="noData && !isLoading"></app-data-not-ready>
          <mat-paginator [pageSizeOptions]="[10, 25, 100]"></mat-paginator>
        </div>
      </div>
    </div>

  `,
  selector: 'app-create-return'
})
export class CreateReturnComponent implements OnInit {
  createShopProgress = false;
  isLoading = true;
  noData = false;
  sales: SalesModel[];
  dateRange$ = this.periodState.dateRange$;
  date;

  dataSource: MatTableDataSource<SalesModel>;
  filterFormControl = new FormControl('', [Validators.nullValidator]);

  displayColumns = ['Date of Sale', 'Channel', 'Product', 'Total Amount', 'Total Items', 'Seller', 'Customer', 'Actions'];
  keysMap = {
    'Date of Sale': 'date',
    Channel: 'channel',
    'Total Amount': 'total_amount',
    'Total Items': 'total_items',
    Seller: 'seller',
    Product: 'product',
    Customer: 'customer',
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit(): void {
    this.initializeVariables();
  }

  constructor(public dialogRef: MatDialogRef<CreateReturnComponent>,
              private readonly formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private readonly snack: MatSnackBar,
              private readonly customerState: CustomerState,
              private returnsState: ReturnsState,
              private salesReportsState: SalesReportsState,
              private storage: StorageService,
              private periodState: PeriodState) {

  }


  async initializeVariables() {
    this.sales = await this.salesReportsState.getSalesFromSource();
    this.dateRange$.subscribe(async dateRange => {
      this.date = dateRange;
      this.salesReportsState.getSalesFromDateRange(this.date);
      // this.sales = await this.salesReportsState.getSalesFromSource(this.date);
    });

    this.salesReportsState.sales$.subscribe(value => {
      this.sales = value.filter(value1 => value1 && !value1.isReturned);
      this.noData = (0 === this.sales.length);
      this.configureDataSource(this.sales);
    });

    this.salesReportsState.loadingSales$.subscribe(
      loading => {
        this.isLoading = loading;
      }
    );

    this.configureDataSource(this.sales);
    this.filterFormControl.valueChanges.subscribe(filterValue => {
      this.sales.filter = filterValue.trim().toLowerCase();
    });
  }

  configureDataSource(allSales) {
    this.dataSource = new MatTableDataSource(allSales);
    // // console.log(this.dataSource.data);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (sale: SalesModel, sortHeaderId: string) => {
      return sale[this.keysMap[sortHeaderId]];
    };
    this.dataSource.paginator = this.paginator;

  }

  closeDialog($event: Event): void {
    $event.preventDefault();
    this.dialogRef.close(null);
  }

  async returnSale(row) {
    // console.log(row);
    // change sale channel to return
    const returns = row;
    // returns.isReturned = true;
    // this.salesReportsState.saleToReturn(returns);
    // returns.items
    // get user
    const user = await this.storage.getActiveUser();
    returns.returnedBy = user;
    returns.returnedDate = toSqlDate(new Date());

    // save in returns
    this.returnsState.saveReturn(returns);
  }
}
