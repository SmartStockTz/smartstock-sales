import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { InvoiceState } from '../states/invoice.state';
import { MatSort } from '@angular/material/sort';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'smartstock-invoices-list',
  template: `
    <mat-card-title class="d-flex flex-row">
        <mat-label>Invoices</mat-label>
      <!-- <button (click)="openAddCategoryDialog()" color="primary" class="ft-button" mat-flat-button>
        Add Category
      </button> -->
      <span class="toolbar-spacer"></span>
      <button [matMenuTriggerFor]="menuinvoices" mat-icon-button>
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menuinvoices>
        <button mat-menu-item>Reload Invoices</button>
      </mat-menu>
    </mat-card-title>
    <mat-card class="mat-elevation-z3">
      <mat-card-content>
      <smartstock-data-not-ready *ngIf="noDataRetrieved  && !fetchinvoicesFlag"></smartstock-data-not-ready>
        <table mat-table *ngIf="!noDataRetrieved  && !fetchinvoicesFlag"  #invoiceSort [dataSource]="invoicesDatasource" matSortDirection="desc" class="mat-elevation-z0" style="margin-top:0px; padding: 10%" matSort>
            <ng-container matColumnDef="Creditor">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Creditor </th>
              <td mat-cell *matCellDef="let element"> {{ element.creditor != null ? element.creditor.company : ""}} </td>
            </ng-container>

            <ng-container matColumnDef="Customer">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Customer </th>
              <td mat-cell *matCellDef="let element"> {{ element.customer != null ? (element.customer.displayName != null ? element.customer.displayName : "") : ""}} </td>
            </ng-container>

            <ng-container matColumnDef="Amount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount </th>
              <td mat-cell *matCellDef="let element"> {{element.amount}} </td>
            </ng-container>

            <ng-container matColumnDef="Product">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Product </th>
              <td mat-cell *matCellDef="let element"> {{element.stock != null ? element.stock.product : ""}} </td>
            </ng-container>

            <ng-container matColumnDef="Quantity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Quantity </th>
              <td mat-cell *matCellDef="let element"> {{element.quantity}} </td>
            </ng-container>

            <ng-container matColumnDef="Status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let element"> {{element.paid != null ? element.paid ? "PAID" : "NOT PAID": ""}} </td>
            </ng-container>

            <ng-container matColumnDef="Date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
              <td mat-cell *matCellDef="let element"> {{element.date}} </td>
            </ng-container>

            <ng-container matColumnDef="Actions">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Actions </th>
              <td mat-cell *matCellDef="let element">
           <div class="row">
            <button *ngIf="element.paid" mat-button mat-raised-button disabled color="primary" (click)="recordPayment(element)">
                Pay
              </button>
              <button *ngIf="!element.paid" mat-button mat-raised-button color="primary" (click)="recordPayment(element)">
                Pay
              </button>
              <!-- <mat-progress-spinner *ngIf="recordingPayment && element.id ==  selectedId" matTooltip="fetch invoices" [diameter]="30" mode="indeterminate"
                                  color="primary" style="margin: 5px"></mat-progress-spinner> -->
           </div>

            </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="invoicesTableColums"></tr>
            <tr mat-row *matRowDef="let row; columns: invoicesTableColums;"></tr>
            </table>
        <div *ngIf="fetchinvoicesFlag">
          <mat-progress-spinner matTooltip="fetch invoices" [diameter]="30" mode="indeterminate"
                                color="primary"></mat-progress-spinner>
        </div>
        <mat-paginator
            #paginator
            (page)="loadPage($event)"
            [length]="invoiceState.totalInvoiceItems | async"
            [pageSizeOptions]="[5, 10, 20]"
            showFirstLastButtons>
        </mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['../styles/invoices-list.style.css']
})
export class InvoicesListComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') matPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  invoicesDatasource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  invoicesTableColums = ['Creditor', 'Customer', 'Amount', 'Product', 'Quantity', 'Status', 'Date', 'Actions'];
  invoicesArray: any[] = [];
  fetchinvoicesFlag = false;
  nameFormControl = new FormControl();
  descriptionFormControl = new FormControl();
  // pageIndex = 0;
  // itemsLength = 0;
  // selectedId = 0;
  recordingPayment = false;
  noDataRetrieved = false;
  onDestroy: Subject<any> = new Subject<any>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly snack: MatSnackBar,
    private readonly changeDector: ChangeDetectorRef,
    public readonly invoiceState: InvoiceState) {
      invoiceState.invoices.pipe(
        takeUntil(this.onDestroy)
      ).subscribe(value => {
        this.invoicesDatasource.data = value;
      });

      invoiceState.isFetchingInvoices.subscribe(value => {
        this.fetchinvoicesFlag = value;
      });
    }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngOnInit(): void {
    this.invoiceState.fetch(5, 0);
    this.invoiceState.countAll();
  }

  loadPage($event: PageEvent): void {
    // console.log($event.pageIndex);
    const skip = (($event.pageIndex) * $event.pageSize);
    const size = $event.pageSize;
    this.invoiceState.fetch(size, skip);
  }

  async recordPayment(invoice) {
    // this.selectedId = invoice.id;
    this.recordingPayment = true;
    await this.invoiceState.recordPayment(invoice).then(val => {
      this.recordingPayment = false;
      invoice.paid = true;
    });
  }

  async saveInvoice(invoice){
    await this.invoiceState.saveInvoice(invoice).then( val => {
        console.log(val);
    });
  }

}

