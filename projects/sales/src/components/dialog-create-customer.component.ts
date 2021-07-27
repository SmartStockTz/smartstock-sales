import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CustomerModel} from '../models/customer.model';

@Component({
  selector: 'app-dialog-created-customer',
  template: `
    <div mat-dialog-content>
      <app-create-customer-form [updateMode]="data?.updateMode"
                                (done)="dialogRef.close($event)"
                                [customer]="data?.customer">

      </app-create-customer-form>
    </div>
  `,
  styleUrls: ['../styles/customers-table.style.scss']
})

export class DialogCreateCustomerComponent {
  constructor(public readonly dialogRef: MatDialogRef<DialogCreateCustomerComponent>,
              @Inject(MAT_DIALOG_DATA) public readonly data: {
                updateMode: boolean,
                customer: CustomerModel
              }) {
  }
}
