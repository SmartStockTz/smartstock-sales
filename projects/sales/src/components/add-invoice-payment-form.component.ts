import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {InvoiceModel} from '../models/invoice.model';
import {InvoiceState} from '../states/invoice.state';

@Component({
  selector: 'app-add-invoice-payment-form',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="dialog-header-line"></div>
      </div>
      <form class="inputs-container" [formGroup]="invoicePaymentForm" (ngSubmit)="addPayment()">
        <div class="input-container">
          <p class="input-head">Amount</p>
          <input formControlName="amount" class="input-body">
          <mat-error *ngIf="invoicePaymentForm.get('amount').invalid">
            Amount required
          </mat-error>
        </div>
        <mat-form-field appearance="outline">
          <mat-label class="input-head">Payment date</mat-label>
          <input matInput formControlName="date" [matDatepicker]="picker">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error>Payment date required</mat-error>
        </mat-form-field>
        <div class="input-container">
          <button color="primary"
                  [disabled]="invoicePaymentForm.invalid || (invoiceState.addPaymentProgress | async)===true"
                  mat-flat-button
                  class="add-button add-button-text">
            Add payment [ {{invoicePaymentForm.get('amount').value | number}} ]
            <mat-progress-spinner style="display: inline-block"
                                  *ngIf="(invoiceState.addPaymentProgress | async)===true"
                                  [diameter]="20" mode="indeterminate" color="primary">
            </mat-progress-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class AddInvoicePaymentFormComponent implements OnInit {
  invoicePaymentForm: UntypedFormGroup;
  @Input() invoice: InvoiceModel;
  @Output() done = new EventEmitter();

  constructor(public readonly invoiceState: InvoiceState,
              private readonly formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.invoicePaymentForm = this.formBuilder.group({
      amount: [0, [Validators.required, Validators.nullValidator, Validators.min(0)]],
      date: [new Date(), [Validators.required, Validators.nullValidator]],
    });
  }

  addPayment() {
    this.invoiceState.addPayment(this.invoice, {
      [this.invoicePaymentForm.value.date]: this.invoicePaymentForm.value.amount
    }).then(_ => {
      this.done.emit('done');
    });
  }
}
