import {Component, Inject, OnInit} from '@angular/core';
import {MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-invoice-details',
  template: `
    <div class="w-100 m-0 p-0">
      <div class="row header text-white align-items-center p-3">
        <div class="col-6 header-icon">
          <mat-icon class="ml-auto p-3">shopping_invoice</mat-icon>
          <p>Invoice Details</p>
        </div>
        <div class="col-6 text-right">
          <h3 class="mb-0">{{data.businessName}}</h3>
          <p class="mb-0">{{data.region}}</p>
          <p>{{data.date | date}}</p>
        </div>
      </div>
      <div class="row px-3 pt-4 m-0 justify-content-between">
        <div>
          <p class="mb-0">Invoice No.</p>
          <p>{{data.id}}</p>
        </div>
        <div>
          <p class="mb-0">Seller</p>
          <p>{{data.sellerFirstName | titlecase }} {{data.sellerLastName | titlecase}}</p>
        </div>
      </div>
      <div class="row px-3 pt-4 m-0 justify-content-between">
        <div>
          <p class="mb-0">Customer</p>
          <p>{{data.fullCustomerName}}</p>
        </div>
        <div>
          <p class="mb-0" style="padding-right: 2.9em">Company</p>
          <p>{{data.customerCompany}}</p>
        </div>
      </div>
      <hr class="my-0">

      <div class="py-3">
        <h3><b>Purchased Items</b></h3>
        <table mat-table [dataSource]="invoiceData">

          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef>Product</th>
            <td mat-cell *matCellDef="let element">{{element.stock.product}}</td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Quantity</th>
            <td mat-cell *matCellDef="let element">{{element.quantity}}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let element">{{element.amount }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="invoiceDataColumns"></tr>
          <tr class="table-data-row" mat-row
              *matRowDef="let row; columns: invoiceDataColumns;"></tr>

        </table>
        <div class="d-flex pt-4 align-items-center justify-content-between">
          <h3 class="text-center col-4 ">Total Amount</h3>
          <h2 class="text-white py-3 col-7 col-md-5 col-lg-6 text-center"
              style="background: #1b5e20;">
            {{data.amount | fedha | async}}/=
          </h2>
        </div>
      </div>
      <div class="py-3">
        <h3><b>Returns</b></h3>
        <table mat-table [dataSource]="returnsData">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let element">{{element.date | date}}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let element">{{element.amount}}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="returnsDataColumns"></tr>
          <tr class="table-data-row" mat-row
              *matRowDef="let row; columns: returnsDataColumns;"></tr>

        </table>
        <div class="d-flex pt-4 align-items-center justify-content-between">
          <h3 class="text-center col-4 ">Total Returns</h3>
          <h2 class="text-white py-3 col-7 col-md-5 col-lg-6 text-center" style="background: #1b5e20;">{{totalAmount | fedha | async}}
            /=</h2>
        </div>
      </div>
      <p class="text-center" style="color: #1b5e20">smartstock.co.tz</p>
    </div>
  `,
  styleUrls: ['../styles/invoice-details.style.css'],
})
export class InvoiceDetailsComponent implements OnInit {
  returnsData: MatTableDataSource<any>;
  returnsDataColumns = ['date', 'amount'];
  totalAmount = 0;
  invoiceData: MatTableDataSource<any>;
  invoiceDataColumns = ['product', 'quantity', 'amount'];

  constructor(private invoiceDetailsSheetRef: MatBottomSheetRef<InvoiceDetailsComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data) {
  }

  ngOnInit(): void {
    this.invoiceData = new MatTableDataSource(this.data.items);
    this.returnsData = new MatTableDataSource(this.data.returns);

    if (this.data.returns && Array.isArray(this.data.returns)) {
      this.totalAmount = this.data.returns.map(a => a.amount).reduce((a, b, i) => {
        return a + b;
      });
    }

  }

  openLink(event: MouseEvent): void {
    this.invoiceDetailsSheetRef.dismiss();
    event.preventDefault();
  }
}
