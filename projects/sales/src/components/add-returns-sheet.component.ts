import {Component, Inject, OnInit} from '@angular/core';
import {MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {MatTableDataSource} from '@angular/material/table';
import {InvoiceModel} from '../models/invoice.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InvoiceService} from '../services/invoice.services';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'smartstock-invoice-details',
  template: `
    <div class="w-100 m-0 p-0">
      <div class="row header text-white align-items-center p-3">
        <div class="col-6 header-icon">
          <mat-icon class="ml-auto p-3">shopping_invoice</mat-icon>
          <p >Returns Details</p>
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
        <div>
          <p class="mb-0">Amount</p>
          <p>{{data.amount | currency: ' '}}</p>
        </div>
      </div>
      <hr class="my-0">


      <div class="py-3">
        <h3><b>Add Return</b></h3>
        <form [formGroup]="addReturnsFormControl">
        <div class="row " style="justify-content: space-evenly">

        <mat-form-field appearance="outline">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Amount</mat-label>
          <input matInput placeholder="Placeholder" type="number" formControlName="amount">
          <mat-hint>Amount</mat-hint>
          <mat-error>Enter numbers only</mat-error>
        </mat-form-field>
        </div>
          <div class="row justify-content-end pr-4" >
            <button mat-raised-button color="warn" (click)="addReturn()">Add Return</button>
          </div>
        </form>
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
          <tr class="table-data-row"  mat-row
              *matRowDef="let row; columns: returnsDataColumns;"></tr>

        </table>
        <div class="d-flex pt-4 align-items-center justify-content-between">
          <h3 class="text-center col-4 ">Total</h3>
          <h2 class="text-white py-3 col-7 col-md-5 col-lg-6 text-center" style="background: #1b5e20;">{{totalAmount | currency: ' '}} /=</h2>
        </div>
      </div>
      <p class="text-center" style="color: #1b5e20">smartstock.co.tz</p>
    </div>
  `,
  styleUrls: ['../styles/invoice-details.style.css'],

})
export class AddReturnSheetComponent implements OnInit{
  returnsData: MatTableDataSource<any>;
  returnsDataColumns = ['date', 'amount'];
  totalAmount = 0;

  addReturnsFormControl: FormGroup;

  constructor(private returnsDetailsSheetRef: MatBottomSheetRef<AddReturnSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data,
              private readonly formBuilder: FormBuilder,
              private invoiceService: InvoiceService,
              private readonly snack: MatSnackBar) {
    this.addReturnsFormControl = this.formBuilder.group({
      date: [ new Date(), [Validators.nullValidator, Validators.required]],
      amount: [new Date(), [Validators.nullValidator, Validators.required]]
      }
    );
  }

  ngOnInit(): void {
    this.returnsData = new MatTableDataSource(this.data.items);

    this.totalAmount = this.data.items.map(a => a.amount).reduce((a, b, i) => {
      return a +  b;
    });
  }

  openLink(event: MouseEvent): void {
    this.returnsDetailsSheetRef.dismiss();
    event.preventDefault();
  }

  addReturn() {
    if (this.addReturnsFormControl.value) {
      this.returnsData.data.push(this.addReturnsFormControl.value);
      this.invoiceService.addReturn(this.data.id, this.addReturnsFormControl.value);
      this.returnsDetailsSheetRef.dismiss();
    } else {
      this.snack.open('Fill Amount before submitting', 'Ok', {
        duration: 3000
      });
    }
  }
}
