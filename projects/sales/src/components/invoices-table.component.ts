import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {takeUntil} from 'rxjs/operators';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatDialog} from '@angular/material/dialog';
import {InvoiceState} from '../states/invoice.state';
import {InvoiceModel} from '../models/invoice.model';
import {InvoiceDetailsModelComponent} from './invoice-details-model.component';
import {AddInvoicePaymentDialogComponent} from './add-invoice-payment-dialog.component';
import { AgoPipe } from '../pipes/ago.pipe';

@Component({
  selector: 'app-invoices-table',
  template: `
    <div style="background: transparent">
      <app-data-not-ready *ngIf="(invoiceState.invoices | async).length === 0"></app-data-not-ready>
      <table mat-table
             *ngIf="(invoiceState.invoices | async).length !== 0"
             style="background: transparent" [dataSource]="dataSource" matSort>
        <ng-container matColumnDef="due">
          <th class="column-head-text" mat-header-cell *matHeaderCellDef mat-sort-header>Due</th>
          <td mat-cell [ngStyle]="dueStyle(row)" *matCellDef="let row"> {{dueWord(row)}} </td>
        </ng-container>
        <ng-container matColumnDef="sponsor">
          <th class="column-head-text" mat-header-cell *matHeaderCellDef mat-sort-header>Sponsor</th>
          <td mat-cell *matCellDef="let row"> {{row.sponsor ? row.sponsor.name : 'N/A'}} </td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th class="column-head-text" mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
          <td mat-cell *matCellDef="let row"> {{row.date | date: 'short'}} </td>
        </ng-container>
        <ng-container matColumnDef="customer">
          <th class="column-head-text" mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
          <td mat-cell *matCellDef="let row"> {{row.customer?.displayName ? row.customer.displayName : row?.customer?.firstName}} </td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th class="column-head-text" mat-header-cell *matHeaderCellDef mat-sort-header>Amount Due</th>
          <td mat-cell *matCellDef="let row"> {{dueAmount(row) | fedha | async}} </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Actions</th>
          <td mat-cell *matCellDef="let row">
            <button [matMenuTriggerFor]="matMenu" mat-icon-button>
              <mat-icon>more_horiz</mat-icon>
            </button>
            <mat-menu #matMenu>
              <button mat-menu-item (click)="details(row)">
                Details
              </button>
              <button mat-menu-item *ngIf="dueAmount(row)!==0" (click)="recordPayment(row)">
                Record payment
              </button>
            </mat-menu>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row class="table-data-row" *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styleUrls: ['../styles/invoice-table.style.scss']
})
export class InvoicesTableComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns = ['due', 'sponsor', 'date', 'customer', 'amount', 'actions'];
  @Input() paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  destroyer: Subject<any> = new Subject<any>();
  dataSource = new MatTableDataSource<InvoiceModel>([]);

  constructor(public readonly invoiceState: InvoiceState,
              public readonly dialog: MatDialog,
              public readonly matSheet: MatBottomSheet) {
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }

  ngOnInit(): void {
    this.invoiceState.invoices.pipe(takeUntil(this.destroyer)).subscribe(value => {
      this.dataSource.connect().next(value);
    });
    this.invoiceState.totalInvoices.pipe(takeUntil(this.destroyer)).subscribe(value => {
      if (!this.dataSource.paginator) {
        return;
      }
      this.dataSource.paginator.length = value;
    });
    this.invoiceState.filterKeyword.pipe(takeUntil(this.destroyer)).subscribe(value => {
      if (value === null) {
        return;
      }
      this.invoiceState.fetchInvoices(0);
    });
  }

  dueStyle(invoice: InvoiceModel): any{
    return new AgoPipe().transform(invoice.dueDate).includes('ago') && invoice.amount>0?{color: 'red'}:{};
  }

  dueWord(invoice: InvoiceModel): any{
    return invoice.amount>0?new AgoPipe().transform(invoice.dueDate):"PAID";
  }

  openPurchasesDetails(invoiceDetailsData: InvoiceModel): any {
    this.matSheet.open(InvoiceDetailsModelComponent, {
        data: invoiceDetailsData
      }
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  recordPayment(row: InvoiceModel): void {
    this.dialog.open(AddInvoicePaymentDialogComponent, {
      closeOnNavigation: true,
      data: row,
      width: '400px'
    });
  }

  details(row): void {
    this.openPurchasesDetails(row);
  }

  dueAmount(row: InvoiceModel) {
    if (!row.payment || typeof row.payment !== 'object') {
      return row.amount;
    }
    return row.amount - Object.values(row.payment).reduce((a, b) => a + Number(b), 0);
  }

  // amountPaid(row: InvoiceModel) {
  //   if (!row.payment || typeof row.payment !== 'object') {
  //     recordPayment 0;
  //   }
  //   recordPayment Object.values(row.payment).reduce((a, b) => a + Number(b), 0);
  // }
}
