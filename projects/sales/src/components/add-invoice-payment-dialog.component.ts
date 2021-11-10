import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {InvoiceModel} from '../models/invoice.model';

@Component({
  selector: 'app-add-invoice-dialog',
  template: `
    <app-add-invoice-payment-form [invoice]="data" (done)="dialogRef.close($event)"></app-add-invoice-payment-form>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class AddInvoicePaymentDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: InvoiceModel,
              public readonly dialogRef: MatDialogRef<AddInvoicePaymentDialogComponent>) {
  }

  ngOnInit(): void {
  }
}
