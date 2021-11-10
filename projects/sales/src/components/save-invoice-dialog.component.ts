import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StockModel} from '../models/stock.model';

@Component({
  selector: 'app-save-invoice-dialog',
  template: `
    <app-save-invoice-form [product]="data" (done)="dialogRef.close($event)"></app-save-invoice-form>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class SaveInvoiceDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: StockModel,
              public readonly dialogRef: MatDialogRef<SaveInvoiceDialogComponent>) {
  }
}
