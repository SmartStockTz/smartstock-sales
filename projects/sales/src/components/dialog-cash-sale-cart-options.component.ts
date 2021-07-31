import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

// @dynamic
@Component({
  selector: 'app-dialog-cash-sale-cart-options',
  template: `
    <div>
      <app-cash-sale-cart-options (done)="dialogRef.close($event)"></app-cash-sale-cart-options>
    </div>
  `,
  styleUrls: ['']
})

export class DialogCashSaleCartOptionsComponent{
  constructor(public readonly dialogRef: MatDialogRef<DialogCashSaleCartOptionsComponent>,
              @Inject(MAT_DIALOG_DATA) public readonly data: any) {
  }
}
