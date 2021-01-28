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
          <p class="mb-0">Amount Due</p>
          <p>{{data.amountDue | currency: ' '}}</p>
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
            <mat-progress-spinner mode="indeterminate" diameter="30" style="display: inline-block"
                                  *ngIf="loading"
                                  color="primary"
            style="margin-top: 5px"></mat-progress-spinner>
            <button mat-raised-button color="warn" [disabled]="loading" (click)="addReturn()">Add Return</button>
          </div>
        </form>
      </div>
      <p class="text-center" style="color: #1b5e20">smartstock.co.tz</p>
    </div>
  `,
  styleUrls: ['../styles/invoice-details.style.css'],

})
export class AddReturnSheetComponent implements OnInit{
  addReturnsFormControl: FormGroup;
  loading = false

  constructor(private returnsDetailsSheetRef: MatBottomSheetRef<AddReturnSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data,
              private readonly formBuilder: FormBuilder,
              private invoiceService: InvoiceService,
              private readonly snack: MatSnackBar) {
    this.addReturnsFormControl = this.formBuilder.group({
      date: [ new Date(), [Validators.nullValidator, Validators.required]],
      amount: [0, [Validators.nullValidator, Validators.required]]
      }
    );
  }

  ngOnInit(): void {
  }

  async addReturn() {
    if (this.addReturnsFormControl.value && this.addReturnsFormControl.value.amount !== 0) {
      if (this.addReturnsFormControl.value.amount > this.data.amountDue){
        console.log(this.addReturnsFormControl.value.amount)
        this.snack.open('Amount entered is higher than the debt', 'Ok', {
          duration: 3000
        });
        return;
      }
      // this.returnsData.data.push(this.addReturnsFormControl.value);
      this.loading = true;
      await this.invoiceService.addReturn(this.data.id, this.addReturnsFormControl.value);
      this.loading = false;
      await this.returnsDetailsSheetRef.dismiss({
        id: this.data.id,
        returns: this.addReturnsFormControl.value
      });
    } else {
      this.snack.open('Fill Amount before submitting', 'Ok', {
        duration: 3000
      });
    }
  }
}
