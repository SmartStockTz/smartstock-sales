import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {ReturnsModel} from '../models/customer.model';
import {MatSort} from '@angular/material/sort';
import {TransactionModel} from 'bfastjs/dist/models/TransactionModel';
import {MatPaginator} from '@angular/material/paginator';
import {CustomerState} from '../states/customer.state';
import {ReturnsState} from '../states/returns.state';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ReturnsDetailsComponent} from './returns-details.component';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-returns-list',
  template: `
    <div class="row m-0">
      <!--<span style="flex-grow: 1;"></span>-->
      <div class="row justify-content-end">
        <mat-form-field appearance="outline">
          <mat-label>Filter</mat-label>
          <input matInput [formControl]="filterFormControl" placeholder="type here ...">
        </mat-form-field>
        <!--<app-period-date-range [hidePeriod]="true"></app-period-date-range>-->
      </div>
      </div>
    <mat-progress-bar *ngIf="isLoading" mode="indeterminate" color="primary"></mat-progress-bar>
    <div class="mat-elevation-z8 d-flex flex-column justify-content-center" style="width: 100%;">
      <table mat-table [dataSource]="dataSource" matSort>
        <ng-container matColumnDef="Product">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Product</th>
          <td mat-cell *matCellDef="let element">{{element.product}}</td>
          <td mat-footer-cell *matFooterCellDef></td>
        </ng-container>
        <ng-container matColumnDef="Channel">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Channel</th>
          <td mat-cell *matCellDef="let element">{{element.channel}}</td>
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
        <ng-container matColumnDef="Returned By">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Returned By</th>
          <td mat-cell
              *matCellDef="let element">{{element.returnedBy != null ? ((element.returnedBy.firstname | titlecase) + " " + element.returnedBy.lastname | titlecase) : element.seller}} </td>
          <td mat-footer-cell *matFooterCellDef></td>
        </ng-container>
        <ng-container matColumnDef="Date of Sale">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Date of Sale</th>
          <td mat-cell *matCellDef="let element">{{element.date}}</td>
          <td mat-footer-cell *matFooterCellDef></td>
        </ng-container>
        <ng-container matColumnDef="Date Returned">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Date Returned</th>
          <td mat-cell *matCellDef="let element">{{element.returnedDate}}</td>
          <td mat-footer-cell *matFooterCellDef></td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayColumns"></tr>
        <tr mat-row class="table-data-row"
            *matRowDef="let row; columns: displayColumns;" (click)="openReturnsDetails(row)"></tr>
        <!--<tr mat-footer-row *matFooterRowDef="displayColumns; sticky: true"></tr>-->
      </table>
      <app-data-not-ready *ngIf="noData && !isLoading"></app-data-not-ready>
      <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>
    </div>
  `,
  styleUrls: []
})
export class ReturnsListComponent implements OnInit {
  isLoading = true;
  noData = false;
  returns: ReturnsModel[];
  dataSource: MatTableDataSource<ReturnsModel>;
  filterFormControl = new FormControl('', [Validators.nullValidator]);

  displayColumns = ['Date of Sale', 'Channel', 'Product' ,'Total Amount', 'Total Items', 'Seller', 'Customer', 'Returned By', 'Date Returned'];
  keysMap = {
    'Date of Sale': 'date',
    Channel: 'channel',
    'Total Amount': 'total_amount',
    'Total Items': 'total_items',
    Seller: 'seller',
    Customer: 'customer',
    Product: 'product',
    'Returned By': 'returnedBy',
    'Date Returned': 'returnedDate'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private readonly returnsState: ReturnsState, private cartDetails: MatBottomSheet, private readonly snack: MatSnackBar) {

  }

  ngOnInit(): void {
    this.initializeVariables();
    // this.transactionsState.loadingTransactions$.subscribe(value => {
    //   this.isLoading = value;
    // });
  }

  async initializeVariables() {
    this.returns = await this.returnsState.getReturnsFromSource();
    this.returnsState.returns$.subscribe(value => {
      this.returns = value;
      this.noData = (0 === this.returns.length);
      this.configureDataSource(this.returns);
    });
    this.returnsState.loadingReturns$.subscribe(
      loading => {
        this.isLoading = loading;
      }
    );
    this.configureDataSource(this.returns);
    this.filterFormControl.valueChanges.subscribe(filterValue => {
      this.returns.filter = filterValue.trim().toLowerCase();
    });
  }

  configureDataSource(allReturns) {
    this.dataSource = new MatTableDataSource(allReturns);
    // // console.log(this.dataSource.data);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (returns: ReturnsModel, sortHeaderId: string) => {
      return returns[this.keysMap[sortHeaderId]];
    };
    this.dataSource.paginator = this.paginator;

  }

  openReturnsDetails(returnsDetailsData): any {
    this.cartDetails.open(ReturnsDetailsComponent, {
      data: {
        id: returnsDetailsData.id,
        channel: returnsDetailsData.channel,
        date: returnsDetailsData.date,
        amount: returnsDetailsData.amount,
        businessName: returnsDetailsData.businessName,
        seller: returnsDetailsData.seller,
        customer: returnsDetailsData.customer,
        time: returnsDetailsData.time,
        region: '', // cartDetailsData.sellerObject.region,
        items: returnsDetailsData.items
      }
    });
  }

}
