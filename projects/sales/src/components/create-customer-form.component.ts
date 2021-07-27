import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CustomerState} from '../states/customer.state';
import {CustomerModel} from '../models/customer.model';

@Component({
  template: `
    <div class="">
      <form [formGroup]="createCustomerForm" (ngSubmit)="createCustomer()" class="create-shop-form-container" style="margin-top: 10px">
        <mat-form-field appearance="" style="width:100%">
          <mat-label>Display name</mat-label>
          <input matInput formControlName="displayName" placeholder="Full name">
          <mat-error>Your name is required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="" style="width:100%">
          <mat-label>Phone Number</mat-label>
          <input type="tel" matInput formControlName="phone" placeholder="Phone Number">
          <mat-error>Phone Number required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="" style="width:100%">
          <mat-label>Email</mat-label>
          <input type="email" matInput formControlName="email" placeholder="Email">
          <mat-error>Email is required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="" style="width:100%">
          <mat-label>Company</mat-label>
          <input matInput formControlName="company" placeholder="Company">
          <mat-error>Company name required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="" style="width:100%">
          <mat-label>TIN No</mat-label>
          <input matInput formControlName="tin" placeholder="TIN No">
          <mat-error>TIN No required</mat-error>
        </mat-form-field>
        <div class="">
          <button style="width: 100%" [disabled]="customerState.saveCustomerFlag | async"
                  class="ft-button btn-block" color="primary" mat-raised-button>
            {{updateMode ? 'Update Customer' : 'Create Customer'}}
            <mat-progress-spinner style="display: inline-block"
                                  *ngIf="customerState.saveCustomerFlag | async" mode="indeterminate"
                                  color="primary" [diameter]="20">
            </mat-progress-spinner>
          </button>
        </div>
      </form>
      <div style="margin-top: 6px;">
        <button class="btn-block" mat-button color="primary" (click)="closeDialog($event)">
          Close
        </button>
      </div>
    </div>
  `,
  selector: 'app-create-customer-form'
})
export class CreateCustomerComponent implements OnInit {
  createCustomerForm: FormGroup;
  @Input() updateMode = false;
  @Input() customer: CustomerModel = null;
  @Output() done = new EventEmitter<CustomerModel>();

  constructor(public readonly formBuilder: FormBuilder,
              public readonly snack: MatSnackBar,
              public readonly customerState: CustomerState) {

  }

  ngOnInit() {
    this.createCustomerForm = this.formBuilder.group({
      displayName: [this.customer?.displayName, [Validators.nullValidator, Validators.required]],
      phone: [this.customer?.phone, [Validators.nullValidator, Validators.required]],
      email: [this.customer?.email],
      company: [this.customer?.company],
      tin: [this.customer?.tin],
      returns: [[]],
    });
  }

  createCustomer() {
    if (this.createCustomerForm.valid) {
      this.createCustomerForm.value.id = this.customer?.id;
      this.customerState.saveCustomer(this.createCustomerForm.value).then((_1) => {
        this.snack.open('Customer Created Successfully', 'Ok', {
          duration: 2000
        });
        this.done.emit(_1);
      }).catch(_4 => {
        this.snack.open(`Failed to ${this.updateMode ? 'update' : 'create'} customer`, 'Ok', {
          duration: 2000
        });
      });
    } else {
      this.snack.open('Please fill all required fields', 'Ok', {
        duration: 2000
      });
    }
  }

  closeDialog($event: Event): void {
    $event.preventDefault();
    this.done.emit(null);
  }

}
