import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {MatTableDataSource} from '@angular/material/table';
import {InvoiceModel} from '../models/invoice.model';
import {InvoiceItemModel} from '../models/invoice-item.model';

@Component({
  selector: 'app-invoice-details-model',
  template: `
    <div class="w-100 m-0 p-0">
      <div class="row header text-white align-items-center p-3">
        <div class="col-6 header-icon">
          <!--          <mat-icon class="ml-auto p-3">shopping</mat-icon>-->
          <p>Invoice Details</p>
        </div>
        <div class="col-6 text-right">
          <p>{{data.date | date}}</p>
        </div>
      </div>
      <div class="row px-3 pt-4 m-0 justify-content-between">
        <div>
          <p class="mb-0">Invoice No.</p>
          <p>{{data?.batchId}}</p>
        </div>
<!--        <div>-->
<!--          <p class="mb-0">Supplier</p>-->
<!--          <p>{{data?.supplier?.name | titlecase }}</p>-->
<!--        </div>-->
      </div>
      <hr class="my-0">
      <div class="py-3">
        <h3><b>Items</b></h3>
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
          <h3 class="text-center col-4 "></h3>
          <h2 class="text-white py-3 col-7 col-md-5 col-lg-6 text-center" style="background: #1b5e20;">
            {{data.amount | fedha | async}} /=
          </h2>
        </div>
      </div>
      <div class="py-3">
        <h3><b>Payments</b></h3>
        <table mat-table [dataSource]="returnsData">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let element">{{element | date:'short'}}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let element">{{data.payment[element] | currency:' '}}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="returnsDataColumns"></tr>
          <tr class="table-data-row" mat-row *matRowDef="let row; columns: returnsDataColumns;"></tr>

        </table>
        <div class="d-flex pt-4 align-items-center justify-content-between">
          <h3 class="text-center col-4 "></h3>
          <h2 class="text-white py-3 col-7 col-md-5 col-lg-6 text-center" style="background: #1b5e20;">
            {{totalAmount | fedha | async}}
          </h2>
        </div>
      </div>
      <p class="text-center" style="color: #1b5e20">smartstock.co.tz</p>
    </div>
  `,
  styleUrls: ['../styles/invoice-details.style.css'],
})
export class InvoiceDetailsModelComponent implements OnInit {
  returnsData: MatTableDataSource<string>;
  returnsDataColumns = ['date', 'amount'];
  totalAmount: unknown = 0;
  invoiceData = new MatTableDataSource<InvoiceItemModel>([]);
  invoiceDataColumns = ['product', 'quantity', 'amount'];

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: InvoiceModel) {
  }

  ngOnInit(): void {
    this.invoiceData = new MatTableDataSource(this.data.items);
    this.returnsData = new MatTableDataSource(Object.keys(this.data.payment ? this.data.payment : {}));

    if (this.data.payment) {
      this.totalAmount = Object.values(this.data.payment).reduce((a: number, b: number) => {
        return a + Number(b);
      }, 0);
    }

  }
}
