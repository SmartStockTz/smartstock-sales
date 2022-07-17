import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

// @dynamic
@Component({
  selector: 'app-dialog-invoice-cart-options',
  template: `
    <div>
      <app-invoice-cart-options (done)="dialogRef.close($event)"></app-invoice-cart-options>
    </div>
  `,
  styleUrls: []
})

export class DialogInvoiceCartOptions{
  constructor(public readonly dialogRef: MatDialogRef<DialogInvoiceCartOptions>,
              @Inject(MAT_DIALOG_DATA) public readonly data: any) {
  }
}
