import {Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {CustomerModel} from '../models/customer.model';

@Component({
  selector: 'app-sheet-create-customer',
  template: `
    <app-create-customer-form (done)="sheetRef.dismiss($event)"
                              [updateMode]="data?.updateMode"
                              [customer]="data?.customer">
    </app-create-customer-form>
  `,
  styleUrls: ['']
})

export class SheetCreateCustomerComponent {
  constructor(public readonly sheetRef: MatBottomSheetRef<SheetCreateCustomerComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public readonly data: {
                updateMode: boolean,
                customer: CustomerModel
              }) {
  }
}
