import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {StockState} from '../states/stock.state';
import {InvoiceState} from '../states/invoice.state';
import {InvoiceCartState} from '../states/invoice-cart.state';
import moment from 'moment';

@Component({
  selector: 'app-save-invoice-form',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="dialog-header-line"></div>
      </div>
      <form class="inputs-container" [formGroup]="invoiceHeaderForm" (ngSubmit)="recordInvoice()">
        <mat-form-field appearance="outline">
          <mat-label class="input-head">Date</mat-label>
          <input matInput formControlName="date" [matDatepicker]="picker">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error>Purchase date required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label class="input-head">Due date</mat-label>
          <input formControlName="dueDate" matInput [matDatepicker]="picker2">
          <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
          <mat-datepicker #picker2></mat-datepicker>
        </mat-form-field>
        <div class="input-container">
          <button color="primary" [disabled]="invoiceHeaderForm.invalid"
                  mat-flat-button
                  class="add-button add-button-text">
            Save invoice [ {{invoiceCartState.cartTotal | async | number}} ]
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class SaveInvoiceFormComponent implements OnInit {
  invoiceHeaderForm: FormGroup;
  @Input() product: StockModel;
  @Output() done = new EventEmitter();

  constructor(public readonly invoiceCartState: InvoiceCartState,
              private readonly invoiceState: InvoiceState,
              private readonly userService: UserService,
              private readonly snack: MatSnackBar,
              private readonly router: Router,
              private readonly stockState: StockState,
              private readonly formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.invoiceHeaderForm = this.formBuilder.group({
      date: [new Date(), [Validators.required, Validators.nullValidator]],
      dueDate: [moment().add(7, 'days').toDate(), [Validators.required, Validators.nullValidator]],
    });
  }

  recordInvoice() {
    this.done.emit('done');
    this.userService.currentUser().then(user => {
      return this.invoiceState.addInvoice({
        id: SecurityUtil.generateUUID(),
        dueDate: this.invoiceHeaderForm.value.dueDate,
        date: moment(this.invoiceHeaderForm.value.date).format('YYYY-MM-DD'),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        customer: {
          id: this.invoiceCartState.selectedCustomer.value.id,
          mobile: this.invoiceCartState.selectedCustomer.value.phone,
          displayName: this.invoiceCartState.selectedCustomer.value.displayName,
          email: this.invoiceCartState.selectedCustomer.value.email,
          firstName: this.invoiceCartState.selectedCustomer.value.displayName,
          lastName: this.invoiceCartState.selectedCustomer.value.displayName,
        },
        payment: {},
        items: this.invoiceCartState.carts.value,
        amount: this.invoiceCartState.cartTotal.value,
        channel: 'credit',
        sponsor: null,
        batchId: SecurityUtil.generateUUID(),
        generatedBy: user.username,
        notes: '',
        refund: {
          amount: 0,
          quantity: 0
        },
        sellerObject: {
          firstname: user.firstname,
          lastname: user.lastname
        },
        status: 'unpaid'
      });
    }).then(_ => {
      this.invoiceCartState.dispose();
      this.router.navigateByUrl('/sale/invoices').catch(console.log);
      this.stockState.stocks.filter = '';
    }).catch(reason => {
      this.snack.open(reason && reason.message ? reason.message : reason.toString(), 'Ok', {
        duration: 3000
      });
    });
  }
}
