import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {InvoiceState} from '../states/invoice.state';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {InvoiceModel} from '../models/invoice.model';
import {InvoiceDetailsComponent} from './invoice-details.component';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {AddReturnSheetComponent} from './add-returns-sheet.component';

@Component({
  template: `
    <mat-card-title>Invoices</mat-card-title>
    <div class="mat-elevation-z8">
      <table mat-table [dataSource]="dataSource" matSort>
        <ng-container matColumnDef="Invoice Id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Invoice Id</th>
          <td mat-cell *matCellDef="let row"> {{row.id}} </td>
        </ng-container>

        <ng-container matColumnDef="Customer">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Customer</th>
          <td mat-cell *matCellDef="let row"> {{row.customer.firstName + " " + row.customer.secondName}} </td>
        </ng-container>

        <ng-container matColumnDef="Amount Due">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount Due</th>
          <td mat-cell *matCellDef="let row"> {{row.amount}} </td>
        </ng-container>

        <ng-container matColumnDef="Amount Paid">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount Paid</th>
          <td mat-cell *matCellDef="let row"> {{row.amount}} </td>
        </ng-container>

        <ng-container matColumnDef="Due Date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Due Date</th>
          <td mat-cell *matCellDef="let row"> {{row.dueDate}} </td>
        </ng-container>

        <ng-container matColumnDef="Date of Sale">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Date of Sale</th>
          <td mat-cell *matCellDef="let row"> {{row.date}} </td>
        </ng-container>

        <ng-container matColumnDef="Seller">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Seller</th>
          <td mat-cell *matCellDef="let row"> {{row.sellerObject.firstname + " " + row.sellerObject.lastname}} </td>
        </ng-container>

        <ng-container matColumnDef="Actions">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Actions</th>
          <td mat-cell *matCellDef="let row">
            <button mat-raised-button color="warn" (click)="clickRow(row, 'button', $event)">Add Returns</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row class="table-data-row" (click)="clickRow(row, 'invoice')"
            *matRowDef="let row; columns: displayedColumns;"></tr>

      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>

    </div>
  `,
  selector: 'smartstock-incomplete-invoices',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  styleUrls: ['../styles/incomplete-invoices.style.css']
})
export class IncompleteInvoicesTableComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<InvoiceModel>;
  displayedColumns = ['Invoice Id', 'Customer', 'Amount Due', 'Amount Paid', 'Due Date', 'Date of Sale', 'Seller', 'Actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private invoiceState: InvoiceState,
              private invoiceDetails: MatBottomSheet,
              private addReturnsSheet: MatBottomSheet) {

  }

  ngOnInit(): void {
    this.fetchInvoices();

  }

  async fetchInvoices() {
    this.dataSource = new MatTableDataSource(await this.invoiceState.fetchSync((await this.invoiceState.countAll()), 0));
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {

  }

  clickRow(data, route, e) {
    if (route === 'button') {
      e.stopPropagation();
      this.recordPayment(data);
    } else if (route === 'invoice') {
      this.openInvoiceDetails(data);
    } else{
      return;
    }
  }

  openInvoiceDetails(invoiceDetailsData): any {
    this.invoiceDetails.open(InvoiceDetailsComponent, {
      data: {
        id: invoiceDetailsData.id,
        date: invoiceDetailsData.date,
        amount: invoiceDetailsData.amount,
        businessName: invoiceDetailsData.sellerObject.businessName,
        sellerFirstName: invoiceDetailsData.sellerObject.firstname,
        sellerLastName: invoiceDetailsData.sellerObject.lastname,
        region: invoiceDetailsData.sellerObject.region,
        items: invoiceDetailsData.items
      }
    });
  }

  recordPayment(invoice) {
    this.addReturnsSheet.open(AddReturnSheetComponent, {
      data: {
        id: invoice.id,
        date:  invoice.date,
        amount: invoice.amount,
        businessName:  invoice.sellerObject.businessName,
        sellerFirstName:  invoice.sellerObject.firstname,
        sellerLastName:  invoice.sellerObject.lastname,
        region:  invoice.sellerObject.region,
        items:  invoice.returns
      }
    });
  }
}

