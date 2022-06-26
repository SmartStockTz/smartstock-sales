import {Component, Inject, NgZone, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SalesModel} from '../models/sale.model';
import {RefundState} from '../states/refund.state';

// @dynamic
@Component({
  template: `
    <div class="row" mat-dialog-content>
      <div class="cash-container">
        <div class="handler-container">
          <div class="handler"></div>
        </div>
        <form (ngSubmit)="refund()" class="refund-form" [formGroup]="refundForm">
          <mat-form-field appearance="outline">
            <mat-label>Amount</mat-label>
            <input matInput type="number" formControlName="amount" required>
            <mat-error>Amount required and maximum must be {{data?.sale?.amount}}</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" required>
            <mat-error>Quantity required and maximum must be {{data?.sale?.quantity}}</mat-error>
          </mat-form-field>
          <button [disabled]="!refundForm.valid || refundState.loadSales.value" mat-flat-button color="primary">
            {{refundState.loadSales.value ? 'SAVING...' : 'SAVE RETURN'}}
          </button>
        </form>
      </div>
    </div>
  `,
  selector: 'app-create-refund-dialog',
  styleUrls: ['../styles/cash-sale.style.css']
})
export class CreateRefundDialogComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  refundForm: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<CreateRefundDialogComponent>,
              public readonly refundState: RefundState,
              public readonly formBuilder: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public readonly data: {
                sale: SalesModel
              }) {

  }

  ngOnInit(): void {
    this.refundForm = this.formBuilder.group({
      amount: [this.data?.sale?.refund?.amount,
        [Validators.max(this.data?.sale?.amount), Validators.required, Validators.nullValidator]],
      quantity: [this.data?.sale?.refund?.quantity,
        [Validators.max(this.data?.sale?.quantity), Validators.required, Validators.nullValidator]]
    });
  }

  async initializeVariables() {
  }

  refund() {
    if (this.refundForm.valid) {
      this.refundState.updateSale(this.refundForm.value, this.data.sale)
        .then(_ => {
          this.dialogRef.close('done');
        });
    }
  }
}
