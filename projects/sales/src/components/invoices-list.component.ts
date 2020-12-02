import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { InvoiceState } from '../states/invoice.state';
import { MatSort } from '@angular/material/sort';


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
        <button (click)="getInvoices()" mat-menu-item>Reload Invoices</button>
      </mat-menu>
    </mat-card-title>
    <mat-card class="mat-elevation-z3">
      <mat-card-content>
        <table mat-table [dataSource]="invoicesDatasource" matSort class="mat-elevation-z0" style="margin-top:0px">
            <ng-container matColumnDef="Creditor">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Creditor </th>
            <td mat-cell *matCellDef="let element"> {{ element.creditor != null ? element.creditor.company : "Creditor Unnamed"}} </td>
            </ng-container>

            <ng-container matColumnDef="Customer">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Customer </th>
            <td mat-cell *matCellDef="let element"> {{ element.customer != null ? (element.customer.firstName + " " + element.customer.lastName) : "Customer Unnamed"}} </td>
            </ng-container>

            <ng-container matColumnDef="Amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount </th>
            <td mat-cell *matCellDef="let element"> {{element.amount}} </td>
            </ng-container>

            <ng-container matColumnDef="Product">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Product </th>
            <td mat-cell *matCellDef="let element"> {{element.product != null ? element.product.product : "Product Unnamed"}} </td>
            </ng-container>

            <ng-container matColumnDef="Quantity">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Quantity </th>
            <td mat-cell *matCellDef="let element"> {{element.quantity}} </td>
            </ng-container>

            <ng-container matColumnDef="Status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
            <td mat-cell *matCellDef="let element"> {{element.paid != null ? element.paid ? "PAID" : "NOT PAID": "No Status"}} </td>
            </ng-container>


            <ng-container matColumnDef="Date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
            <td mat-cell *matCellDef="let element"> {{element.date}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="invoicesTableColums"></tr>
            <tr mat-row *matRowDef="let row; columns: invoicesTableColums;"></tr>
            </table>
        <div *ngIf="fetchinvoicesFlag">
          <mat-progress-spinner matTooltip="fetch invoices" [diameter]="30" mode="indeterminate"
                                color="primary"></mat-progress-spinner>
        </div>
        <mat-paginator [pageIndex]="0" #paginator (page)="pageChanged()" [pageSize]="10" [pageSizeOptions]="[5,10,50]" showFirstLastButtons></mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
    styleUrls: ['../styles/invoices-list.style.css']
})
export class InvoicesListComponent implements OnInit, AfterViewInit {
    @ViewChild('paginator') matPaginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    invoicesDatasource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
    invoicesTableColums = ['Creditor', 'Customer', 'Amount', 'Product', 'Quantity', 'Status', 'Date'];
    invoicesArray: any[] = [];
    fetchinvoicesFlag = false;
    nameFormControl = new FormControl();
    descriptionFormControl = new FormControl();

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly dialog: MatDialog,
        private readonly snack: MatSnackBar,
        private readonly changeDector: ChangeDetectorRef,
        private readonly invoiceState: InvoiceState) {
    }
    ngAfterViewInit(): void {
        this.invoicesDatasource.sort = this.sort;
        this.getInvoices();
    }

    ngOnInit(): void {
    }

    pageChanged(){
        this.getInvoices();
    }

    getInvoices(): void {
        this.fetchinvoicesFlag = true;
        this.invoicesDatasource.paginator = this.matPaginator;
        this.changeDector.detectChanges();
        this.invoiceState.getTotalInvoice().then(total=>{
          this.invoicesDatasource.paginator.length = total;
          this.invoicesDatasource.paginator.pageIndex = this.invoicesDatasource.data.length/this.matPaginator.pageSize;
          return this.invoiceState.getInvoices({
            size:  this.matPaginator.pageSize,
            skip: this.matPaginator.pageSize * this.matPaginator.pageIndex
          });
        }).then(data => {
                this.invoicesArray = data;
                this.invoicesDatasource.data = this.invoicesArray;
                this.invoicesDatasource.sort = this.sort;
                this.fetchinvoicesFlag = false;
                this.changeDector.detectChanges();
        }).catch(reason => {
            console.log(reason);
            this.fetchinvoicesFlag = false;
        });

    }

    
    openAddCategoryDialog(): void {

    }
}

