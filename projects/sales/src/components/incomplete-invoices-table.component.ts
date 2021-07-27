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
import {MatSnackBar} from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  template: `
    <mat-card-title>Invoices</mat-card-title>
    <div class="row justify-content-end">
      <div class="col-2" style="margin-right: 9em">
        <mat-form-field>
          <mat-label>Filter</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Ex. John" #input>
        </mat-form-field>
      </div>
    </div>

    <div class="mat-elevation-z8">
      <mat-progress-bar *ngIf="fetchingInvoices" mode="indeterminate" color="primary"></mat-progress-bar>
      <app-data-not-ready *ngIf="noData"></app-data-not-ready>
      <table mat-table *ngIf="!noData" [dataSource]="dataSource" matSort>
        <ng-container matColumnDef="Invoice Id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Invoice Id</th>
          <td mat-cell *matCellDef="let row"> {{row.id}} </td>
        </ng-container>

        <ng-container matColumnDef="Customer">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Customer</th>
          <td mat-cell *matCellDef="let row"> {{row.fullCustomerName}} </td>
        </ng-container>

        <ng-container matColumnDef="Amount Due">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount Due</th>
          <td mat-cell *matCellDef="let row"> {{row.amountDue}} </td>
        </ng-container>

        <ng-container matColumnDef="Amount Paid">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount Paid</th>
          <td mat-cell *matCellDef="let row"> {{row.amountPaid}} </td>
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
          <td mat-cell *matCellDef="let row"> {{row.fullSellerName}} </td>
        </ng-container>

        <ng-container matColumnDef="Actions">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Actions</th>
          <td mat-cell *matCellDef="let row">
            <button mat-raised-button [disabled]="row.paid" color="warn" (click)="clickRow(row, 'button', $event)">Add Returns</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row class="table-data-row" (click)="clickRow(row, 'invoice', $event)"
            *matRowDef="let row; columns: displayedColumns;"></tr>

      </table>
      <mat-paginator *ngIf="!noData" [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>
    </div>
  `,
  selector: 'app-incomplete-invoices',
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
  fetchingInvoices = false;
  noData = false;
  displayedColumns = ['Invoice Id', 'Customer', 'Amount Due', 'Amount Paid', 'Due Date', 'Date of Sale', 'Seller', 'Actions'];
  keysMap = {
    'Invoice Id': 'id',
    Customer: 'fullCustomerName',
    'Amount Due': 'amountDue',
    'Amount Paid': 'amountPaid',
    'Due Date': 'dueDate',
    'Date of Sale': 'date',
    Seller: 'fullSellerName',
    Actions: 'paid'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private invoiceState: InvoiceState,
              private invoiceDetails: MatBottomSheet,
              private addReturnsSheet: MatBottomSheet,
              private snack: MatSnackBar) {
  }

  ngOnInit(): void {
    this.fetchInvoices();

  }

  async fetchInvoices() {
    this.fetchingInvoices = true;
    try {
      let invoices = await this.invoiceState.fetchSync(await this.invoiceState.countAll(), 0);
      invoices = invoices.map(((value: InvoiceModel, index) => {
        return {
          ...value,
          date: moment(value.date).format('YYYY-MM-DD'),
          dueDate: moment(value.dueDate).format('YYYY-MM-DD'),
          fullCustomerName: value.customer.firstName + ' ' + value.customer.secondName,
          amountDue: value.amount - this.invoiceState.calculateTotalReturns(value.returns),
          amountPaid: this.invoiceState.calculateTotalReturns(value.returns),
          fullSellerName: value.sellerObject.firstname + ' ' + value.sellerObject.lastname,
          paid: value.amount <= this.invoiceState.calculateTotalReturns(value.returns),
          customerCompany: value.customer.company
        };
      }));
      this.configureDataSource(invoices);
    } catch (e) {
      this.noData = true;
      this.snack.open('An Error occurred fetching the invoices please reload.', 'OK', {
        duration: 3000
      });
    }

    this.fetchingInvoices = false;

  }

  configureDataSource(invoices) {
    this.dataSource = new MatTableDataSource(invoices);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (invoice: InvoiceModel, sortHeaderId: string) => {
      return invoice[this.keysMap[sortHeaderId]];
    };
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit(): void {

  }

  clickRow(data, route, e) {
    if (route === 'button') {
      e.stopPropagation();
      this.recordPayment(data);
    } else if (route === 'invoice') {
      this.openInvoiceDetails(data);
    } else {
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
        items: invoiceDetailsData.items,
        returns: invoiceDetailsData.returns,
        fullCustomerName: invoiceDetailsData.fullCustomerName,
        customerCompany: invoiceDetailsData.customerCompany
      }
    });
  }

  recordPayment(invoice) {
    const addReturnSheetRef = this.addReturnsSheet.open(AddReturnSheetComponent, {
      data: {
        id: invoice.id,
        date: invoice.date,
        amount: invoice.amount,
        amountDue: invoice.amountDue,
        businessName: invoice.sellerObject.businessName,
        sellerFirstName: invoice.sellerObject.firstname,
        sellerLastName: invoice.sellerObject.lastname,
        region: invoice.sellerObject.region,
        items: invoice.returns
      }
    });

    addReturnSheetRef.afterDismissed().subscribe(result => {
      if (result) {
        this.dataSource.data = this.dataSource.data.map(value => {
          if (value.id === result.id) {
            if (value.returns && Array.isArray(value.returns)) {
              value.returns.push(result.returns);
            } else {
              value.returns = [result.returns];
            }
          }
          return {
            ...value,
            fullCustomerName: value.customer.firstName + ' ' + value.customer.secondName,
            amountDue: value.amount - this.invoiceState.calculateTotalReturns(value.returns),
            amountPaid: this.invoiceState.calculateTotalReturns(value.returns),
            fullSellerName: value.sellerObject.firstname + ' ' + value.sellerObject.lastname,
            paid: value.amount <= this.invoiceState.calculateTotalReturns(value.returns),
            customerCompany: value.customer.company
          };
        });
      }
    });
  }
}

