import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Subject} from 'rxjs';
import {RefundState} from '../states/refund.state';
import {MatTableDataSource} from '@angular/material/table';
import {SalesModel} from '../models/sale.model';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {CreateRefundDialogComponent} from './create-refund-dialog.component';

@Component({
  selector: 'app-refund-body-table-component',
  template: `
    <table mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="check">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>
          <mat-checkbox></mat-checkbox>
        </th>
        <td class="table-body-text" mat-cell *matCellDef="let row">
          <mat-checkbox></mat-checkbox>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>
      <ng-container matColumnDef="product">
        <th mat-header-cell class="table-column-title" *matHeaderCellDef mat-sort-header>Product</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row.product}} </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>
      <ng-container matColumnDef="time">
        <th mat-header-cell class="table-column-title" *matHeaderCellDef mat-sort-header>Time</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row.timer | muda}} </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>
      <ng-container matColumnDef="amount">
        <th mat-header-cell class="table-column-title" *matHeaderCellDef mat-sort-header>Amount</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{ row.amount | fedha | async}} </td>
        <!--<td mat-footer-cell *matFooterCellDef>Total</td>-->
      </ng-container>
      <ng-container matColumnDef="refund">
        <th mat-header-cell class="table-column-title" *matHeaderCellDef mat-sort-header>Refund</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row.refund?.amount | fedha | async}} </td>
        <!--<td mat-footer-cell *matFooterCellDef>{{getTotal()}}</td>-->
      </ng-container>
      <ng-container matColumnDef="quantity">
        <th mat-header-cell class="table-column-title" *matHeaderCellDef mat-sort-header>Return Quantity</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row.refund?.quantity | number}} </td>
        <!--<td mat-footer-cell *matFooterCellDef>{{getTotal()}}</td>-->
      </ng-container>
      <ng-container matColumnDef="action">
        <th mat-header-cell class="table-column-title" *matHeaderCellDef mat-sort-header>Actions</th>
        <td class="table-body-text" mat-cell *matCellDef="let row">
          <button [matMenuTriggerFor]="menu" mat-icon-button>
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #menu>
            <mat-nav-list>
              <mat-list-item style="padding: 0 16px!important;" (click)="refund(row)">
                <p matLine>Revert / Return</p>
                <mat-icon matListIcon>history</mat-icon>
              </mat-list-item>
              <mat-list-item style="padding: 0 16px!important;" (click)="clear(row)">
                <p matLine>Clear revert</p>
                <mat-icon matListIcon>clear</mat-icon>
              </mat-list-item>
            </mat-nav-list>
          </mat-menu>
        </td>
      </ng-container>
      <tr class="table-header" mat-header-row *matHeaderRowDef="displayColumns"></tr>
      <tr mat-row class="table-data-row" *matRowDef="let row; columns: displayColumns;"></tr>
    </table>
  `,
  styleUrls: ['../styles/refund-body.style.scss']
})

export class RefundBodyTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  destroyer: Subject<any> = new Subject<any>();
  dataSource: MatTableDataSource<SalesModel> = new MatTableDataSource<SalesModel>([]);
  displayColumns = ['check', 'product', 'time', 'amount', 'refund', 'quantity', 'action'];

  constructor(public readonly deviceState: DeviceState,
              public readonly matDialog: MatDialog,
              public readonly refundState: RefundState) {
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.refundState.sales
      .pipe(takeUntil(this.destroyer))
      .subscribe(value => {
        this.dataSource.data = value;
      });

    this.refundState.filterKeyword
      .pipe(takeUntil(this.destroyer))
      .subscribe(value => {
        if (value === null) {
          return;
        }
        this.dataSource.filter = value;
      });
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }

  refund(row) {
    this.matDialog.open(CreateRefundDialogComponent, {
      closeOnNavigation: true,
      width: '400px',
      data: {
        sale: row
      }
    });
  }

  clear(row) {
    this.refundState.updateSale({
      amount: 0,
      quantity: 0,
    }, row).catch(console.log);
  }
}
