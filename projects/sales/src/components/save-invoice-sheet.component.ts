import {Component, Inject} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-save-invoice-sheet',
  template: `
    <app-save-invoice-form [product]="data" (done)="dialogRef.dismiss($event)"></app-save-invoice-form>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class SaveInvoiceSheetComponent {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public readonly data: StockModel,
              public readonly dialogRef: MatBottomSheetRef<SaveInvoiceSheetComponent>) {
  }
}
