import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CustomerState} from '../states/customer.state';

@Component({
  template: `
    <div class="row" mat-dialog-content>
      <mat-card-title>Create Customer</mat-card-title>

      <form [formGroup]="createCustomerForm" (ngSubmit)="createCustomer()" class="create-shop-form-container" style="margin-top: 10px">
        <mat-form-field appearance="" style="width:100%">
          <mat-label>Company Name</mat-label>
          <input matInput formControlName="company" placeholder="company">
          <mat-error>Company name required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="" style="width:100%">
          <mat-label>Phone Number</mat-label>
          <input matInput formControlName="phone" placeholder="Phone Number">
          <mat-error>Phone Number required</mat-error>
        </mat-form-field>

        <p>Optional Details</p>

        <mat-form-field appearance="" style="width:100%">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" placeholder="First Name">
          <mat-error>First Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="" style="width:100%">
          <mat-label>Second Name</mat-label>
          <input matInput formControlName="secondName" placeholder="Second Name">
          <mat-error>Second Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="" style="width:100%">
          <mat-label>Customer TIN</mat-label>
          <input matInput formControlName="tin" placeholder="tin">
        </mat-form-field>

        <mat-form-field appearance="" style="width:100%">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" placeholder="email">
        </mat-form-field>

        <div class="row">
          <button style="width: 100%" [disabled]="createShopProgress" class="ft-button btn-block" color="primary" mat-raised-button>
            Create Customer
            <mat-progress-spinner style="display: inline-block" *ngIf="createShopProgress" mode="indeterminate"
                                  color="primary" [diameter]="20"></mat-progress-spinner>
          </button>
        </div>
      </form>
    </div>
    <div style="margin-top: 6px">
      <button class="btn-block" mat-button color="primary" (click)="closeDialog($event)">
        Close
      </button>
    </div>
  `,
  selector: 'app-create-customer'
})
export class CreateCustomerComponent implements OnInit {
  createCustomerForm: FormGroup;
  createShopProgress = false;

  constructor(public dialogRef: MatDialogRef<CreateCustomerComponent>,
              private readonly formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private readonly snack: MatSnackBar,
              private readonly customerState: CustomerState) {

  }

  ngOnInit() {
    this.createCustomerForm = this.formBuilder.group({
      firstName: [''],
      secondName: [''],
      phone: ['', [Validators.nullValidator, Validators.required]],
      email: [''],
      company: ['', [Validators.nullValidator, Validators.required]],
      tin: [''],
      returns: [[]],
    });
  }

  createCustomer() {
    if (this.createCustomerForm.valid) {
      this.createShopProgress = true;

      this.createCustomerForm.value.displayName = this.createCustomerForm.value.firstName;
      this.customerState.saveCustomer(this.createCustomerForm.value).then((val) => {
        this.createShopProgress = false;
        this.snack.open('Customer Created Successfully', 'Ok', {
          duration: 3000
        });
        this.dialogRef.close(null);
      }).catch(err => {
        this.snack.open('Failed to create Customer', 'Cancel', {
          duration: 3000
        });
      });

    } else {
      this.snack.open('Please fill all required fields', 'Ok', {
        duration: 3000
      });
    }
  }

  closeDialog($event: Event): void {
    $event.preventDefault();
    this.dialogRef.close(null);
  }

}
