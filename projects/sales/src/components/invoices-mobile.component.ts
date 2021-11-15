import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Subject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {takeUntil} from 'rxjs/operators';
import {InvoiceState} from '../states/invoice.state';
import {InvoiceDetailsModelComponent} from './invoice-details-model.component';
import {InvoiceModel} from '../models/invoice.model';
import {AddInvoicePaymentDialogComponent} from './add-invoice-payment-dialog.component';

@Component({
  selector: 'app-invoices-mobile',
  template: `
    <mat-progress-bar mode="indeterminate" *ngIf="invoiceState.fetchingInvoicesProgress | async"></mat-progress-bar>
    <app-data-not-ready *ngIf="(invoiceState.invoices | async).length === 0"></app-data-not-ready>
    <cdk-virtual-scroll-viewport [itemSize]="90" style="height: 92vh"
                                 infinite-scroll
                                 (scrolled)="loadMore($event)"
                                 [scrollWindow]="false"
                                 [infiniteScrollThrottle]="5"
                                 [infiniteScrollDistance]="3">
      <mat-nav-list>
        <mat-list-item [matMenuTriggerFor]="menu" *cdkVirtualFor="let invoice of invoiceState.invoices | async">
          <!--          <p style="width: 80vw; text-align: start" class="text-truncate"-->
          <p matLine>Amount Due: {{dueAmount(invoice) | fedha | async}}</p>
          <p matLine>{{invoice.type}}</p>
          <mat-card-subtitle matLine>{{invoice.date | date:'short'}}</mat-card-subtitle>
          <button mat-icon-button matSuffix>
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu xPosition="before" #menu>
            <button mat-menu-item (click)="details(invoice)">Details</button>
            <button mat-menu-item *ngIf="dueAmount(invoice)!==0" (click)="return(invoice)">
              Add payment
            </button>
          </mat-menu>
        </mat-list-item>
        <div style="height: 150px; padding-top: 16px; justify-content: center; align-items: start; display: flex">
          <button (click)="loadMore($event)" mat-button color="primary" *ngIf="(invoiceState.loadMoreProgress | async) === false">
            Load more
          </button>
          <mat-progress-spinner *ngIf="(invoiceState.loadMoreProgress | async) === true"
                                mode="indeterminate" diameter="20" color="primary">
          </mat-progress-spinner>
        </div>
      </mat-nav-list>
    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: []
})
export class InvoicesMobileComponent implements OnInit, OnDestroy {
  @Input() paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  destroyer: Subject<any> = new Subject<any>();

  constructor(public readonly invoiceState: InvoiceState,
              public readonly dialog: MatDialog,
              public readonly matSheet: MatBottomSheet) {
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }

  ngOnInit(): void {
    this.invoiceState.fetchInvoices(0);
    this.invoiceState.filterKeyword.pipe(takeUntil(this.destroyer)).subscribe(value => {
      if (value === null) {
        return;
      }
      this.invoiceState.fetchInvoices(0);
    });
  }

  openPurchasesDetails(purchaseDetailsData): any {
    this.matSheet.open(InvoiceDetailsModelComponent, {
        data: purchaseDetailsData
      }
    );
  }

  return(row: InvoiceModel): void {
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

  // amountPaid(row: PurchaseModel) {
  //   if (!row.payment || typeof row.payment !== 'object') {
  //     return 0;
  //   }
  //   return Object.values(row.payment).reduce((a, b) => a + Number(b), 0);
  // }

  loadMore($event: any) {
    this.invoiceState.loadMore();
  }
}
