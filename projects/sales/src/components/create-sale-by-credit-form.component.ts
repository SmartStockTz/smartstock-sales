import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TransferState} from '../states/transfer.state';
import {MessageService, SecurityUtil, toSqlDate, UserService} from '@smartstocktz/core-libs';
import {MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {StockModel} from '../models/stock.model';
import {ProductSearchDialogComponent} from './product-search.component';
import {CreateCreditorComponent} from './create-creditor.component';
import {Observable} from 'rxjs';
import {CreditorState} from '../states/creditor.state';
import {of} from 'rxjs/internal/observable/of';
import {SalesModel} from '../models/sale.model';
import {SalesState} from '../states/sales.state';
import {CustomerState} from '../states/customer.state';
import {CreateCustomerComponent} from './create-customer-form.component';
import {InvoiceModel} from '../models/invoice.model';
import {InvoiceState} from '../states/invoice.state';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sales-create-sale-by-credit-form',
  template: `
    <div class="">
      <form *ngIf="transferFormGroup" [formGroup]="transferFormGroup">
        <h1>Details</h1>
        <mat-card>
          <!--<mat-label>Choose Creditor</mat-label>-->
          <!--<div class="row" style="padding: 0px 0 0 0">-->
          <!--<div class="col-lg-6 col-6" style="width: 100%; padding: 10; margin-left: 0px">-->
          <!--<mat-form-field style="width:100%" appearance="fill">-->
          <!--<mat-select style="width:100%" formControlName="creditor">-->
          <!--<mat-option  *ngFor="let option of creditors | async" [value]="option.company">-->
          <!--{{option.company}}-->
          <!--</mat-option>-->
          <!--</mat-select>-->
          <!--</mat-form-field>-->
          <!--</div>-->
          <!--<div class="col-lg-6 col-6" style="padding-top:6px;">-->
          <!--<button color="primary" (click)='_getCreditors()' mat-icon-button>-->
          <!--<mat-icon>refresh</mat-icon>-->
          <!--</button>-->
          <!--<button color="primary" (click)='createCreditor()' mat-icon-button>-->
          <!--<mat-icon>add_circle</mat-icon>-->
          <!--</button>-->
          <!--</div>-->
          <!--</div>-->

          <mat-label>Choose Customer</mat-label>
          <div class="row" style="padding: 0px 0 0 0">
            <div class="col-lg-6 col-6" style="width: 100%; padding: 10px; margin-left: 0px">
              <mat-form-field style="width:100%" appearance="fill">
                <mat-select style="width:100%" formControlName="customer">
                  <mat-option *ngFor="let option of customers | async" [value]='option.firstName'>
                    {{option.secondName ? (option.firstName + " " + option.secondName) : option.firstName}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="col-lg-2 col-2" style="padding-top:6px;">
              <button color="primary" (click)='_getCustomers()' mat-icon-button>
                <mat-icon>refresh</mat-icon>
              </button>
              <button color="primary" (click)='createCustomer()' mat-icon-button>
                <mat-icon>add_circle</mat-icon>
              </button>

            </div>
            <div class="row" style="width: 100%; padding: 10px; margin-left: 0px">
              <mat-form-field appearance="fill">
                <mat-label>Due date</mat-label>
                <input matInput formControlName="dueDate" [matDatepicker]="picker">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>
          </div>

          <mat-form-field appearance="outline" style="width: 100%; margin-top: 20px">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="note" rows="3"></textarea>
            <mat-error>Write an invoice note</mat-error>
          </mat-form-field>
        </mat-card>
        <h1 style="margin-top: 16px">Products</h1>
        <div style="margin-bottom: 16px; display: flex; flex-direction: row; flex-wrap: wrap">
          <button [disabled]="(transferState.isSaveTransfers | async) === true"
                  (click)="addProductToTable($event)"
                  mat-button color="primary">
            <mat-icon matSuffix>add</mat-icon>
            Add Product
          </button>
          <div style="width: 16px; height: 16px"></div>
          <button (click)="saveCreditSale()" [disabled]="showProgress" mat-flat-button color="primary">
            <mat-icon matSuffix>done_all</mat-icon>
            Submit
            <mat-progress-spinner mode="indeterminate" diameter="20" style="display: inline-block"
                                  *ngIf="showProgress"
                                  color="primary"></mat-progress-spinner>
          </button>
          <!--<div *ngIf="showSpinner" style="padding-left: 50px ">-->
          <!--<mat-spinner diameter="50"></mat-spinner>-->
          <!--</div>-->
        </div>
        <mat-card>
          <table mat-table [dataSource]="transfersDatasource">
            <ng-container cdkColumnDef="product">
              <th mat-header-cell *cdkHeaderCellDef>Product</th>
              <td mat-cell *cdkCellDef="let element">{{element.product.product}}</td>
              <td mat-footer-cell *cdkFooterCellDef>
                <h2 style="margin: 0; padding: 5px">TOTAL</h2>
              </td>
            </ng-container>
            <ng-container cdkColumnDef="quantity">
              <th mat-header-cell *cdkHeaderCellDef>Quantity</th>
              <td mat-cell *cdkCellDef="let element">
                <input class="quantity-input" (change)="updateQuantity(element, $event)" type="number" min="1"
                       [value]="element.quantity">
              </td>
              <td mat-footer-cell *cdkFooterCellDef>
              </td>
            </ng-container>
            <ng-container cdkColumnDef="amount">
              <th mat-header-cell *cdkHeaderCellDef>Amount</th>
              <td mat-cell *cdkCellDef="let element">
                <input class="quantity-input" (change)="updateAmount(element, $event)" type="number" min="0"
                       [value]="element.amount">
              </td>
              <td mat-footer-cell *cdkFooterCellDef>
              </td>
            </ng-container>
            <ng-container cdkColumnDef="subAmount">
              <th mat-header-cell *cdkHeaderCellDef>Sub Amount</th>
              <td mat-cell *cdkCellDef="let element">{{(element.quantity * element.amount) | number}}</td>
              <td mat-footer-cell *cdkFooterCellDef>
                <h1 style="margin: 0; padding: 5px">{{totalCost | number}}</h1>
              </td>
            </ng-container>
            <ng-container cdkColumnDef="action">
              <th mat-header-cell *cdkHeaderCellDef>Action</th>
              <td mat-cell *cdkCellDef="let element">
                <button (click)="removeItem($event, element)" mat-icon-button color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
              <td mat-footer-cell *cdkFooterCellDef>
              </td>
            </ng-container>
            <tr mat-header-row *cdkHeaderRowDef="transfersTableColumn"></tr>
            <tr mat-row *matRowDef="let row; columns transfersTableColumn"></tr>
          </table>
        </mat-card>
      </form>
    </div>
  `,
  styleUrls: ['../styles/create-sale-by-credit.style.css']
})
export class SaleByCreditCreateFormComponent implements OnInit {
  showProgress = false;
  private currentUser: any;
  creditors: Observable<any[]>;
  customers: Observable<any[]>;
  transferFormGroup: FormGroup;
  transfersDatasource: MatTableDataSource<{ quantity: number, product: StockModel, amount: number }> = new MatTableDataSource([]);
  transfersTableColumn = ['product', 'quantity', 'amount', 'subAmount', 'action'];
  selectedProducts: { quantity: number, product: StockModel, amount: number }[] = [];
  totalCost = 0;

  constructor(private readonly formBuilder: FormBuilder,
              private readonly message: MessageService,
              private readonly userService: UserService,
              private readonly customerState: CustomerState,
              private readonly salesState: SalesState,
              private readonly dialog: MatDialog,
              private router: Router,
              public readonly transferState: TransferState,
              public readonly creditorState: CreditorState,
              public readonly invoiceState: InvoiceState,
              private readonly snack: MatSnackBar) {
  }

  ngOnInit(): void {
    this.transferFormGroup = this.formBuilder.group({
      date: [new Date(), [Validators.required, Validators.nullValidator]],
      dueDate: [new Date(), [Validators.nullValidator]],
      note: ['Invoice note', [Validators.nullValidator]],
      creditor: [null, [Validators.required, Validators.nullValidator]],
      customer: [null, [Validators.required, Validators.nullValidator]],
      amount: [null, [Validators.required, Validators.nullValidator]],
    });

    // this._handleCreditorNameControl();
    // this._getCreditors();
    this._getCurrentUser();
    this._handleCustomerNameControl();
    this._getCustomers();
  }

  createCustomer() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  private _getCurrentUser() {
    this.userService.currentUser()
      .then(value => {
        this.currentUser = value;
      })
      .catch(_ => {
        this.currentUser = undefined;
      });
  }

  private _handleCustomerNameControl(): void {
    this.transferFormGroup.get('customer').valueChanges.subscribe((enteredName: string) => {
      if (enteredName) {
        this.customerState.getCustomers()
          .then(customers => {
            if (!customers) {
              customers = [];
            }
            this.customers = of(
              customers
            );
          })
          .catch();
      }
    });
  }

  _getCustomers(): void {
    this.customerState.getCustomers()
      .then(customers => {
        if (!customers) {
          customers = [];
        }

        customers = customers.filter(customer => customer.firstName);
        this.customers = of(customers);
      })
      .catch();
  }

  private _handleCreditorNameControl(): void {

    this.transferFormGroup.get('creditor').valueChanges.subscribe((enteredName: string) => {
      if (enteredName) {
        this.creditorState.getCreditors()
          .then(customers => {
            if (!customers) {
              customers = [];
            }
            this.creditors = of(
              customers
            );
          })
          .catch();
      }
    });
  }

  _getCreditors(): void {
    this.creditorState.getCreditors()
      .then(customers => {
        if (!customers) {
          customers = [];
        }
        this.creditors = of(customers);
      })
      .catch();
  }

  updateTotalCost(): void {
    this.totalCost = this.transfersDatasource.data
      .map(x => x.quantity * x.amount)
      .reduce((a, b) => a + b, 0);
  }

  async saveCreditSale(): Promise<void> {
    if (this.transfersDatasource.data.length === 0) {
      this.snack.open('Select Products to add before submitting', 'Ok', {
        duration: 3000
      });
      return;
    }

    this.showProgress = true;

    const items = [];
    let customer;

    this.customers.subscribe(value => {
      customer = value.find(val => val.firstName === this.transferFormGroup.get('customer').value);
    });

    let totalAmount = 0;

    this.transfersDatasource.data.forEach(element => {
      const sale = {
        stock: element.product,
        amount: element.amount,
        quantity: element.quantity,
      };
      totalAmount += element.amount * element.quantity;
      items.push(sale);
    });

    const invoice: InvoiceModel = {
      date: this.transferFormGroup.value.date,
      dueDate: this.transferFormGroup.value.dueDate,
      items,
      sellerObject: this.currentUser,
      customer,
      amount: totalAmount,
      quantity: items.length,
      batchId: SecurityUtil.generateUUID()
    };

    await this.invoiceState.saveInvoice(invoice).then(val => {
      this.transfersDatasource.data = [];
      this.selectedProducts = [];
      this.snack.open('Your invoice has been recorded.', 'Ok', {
        duration: 3000
      });
      this.router.navigateByUrl('/sale/invoices/list').catch(console.log);
    }).catch(err => {
      this.snack.open('Please fix all errors, and make sure you add at least one product then submit again', 'Ok', {
        duration: 3000
      });
    });
    this.showProgress = false;
  }

  createCreditor() {
    const dialogRef = this.dialog.open(CreateCreditorComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  addProductToTable($event: MouseEvent): void {
    $event.preventDefault();
    this.dialog.open(ProductSearchDialogComponent).afterClosed().subscribe(value => {
      if (value && value.product) {
        this.selectedProducts.unshift({
          quantity: 1,
          product: value,
          amount: 0
        });
        this.transfersDatasource = new MatTableDataSource<any>(this.selectedProducts);
        this.updateTotalCost();
      }
    });
  }

  removeItem($event: MouseEvent, element: { quantity: number, product: StockModel }): void {
    $event.preventDefault();
    this.selectedProducts = this.selectedProducts.filter(x => x.product.id !== element.product.id);
    this.transfersDatasource = new MatTableDataSource<any>(this.selectedProducts);
    this.updateTotalCost();
  }

  updateQuantity(element: { quantity: number, product: StockModel }, $event: Event): void {
    // @ts-ignore
    const newQuantity = Number($event.target.value);
    // if (newQuantity <= 0) {
    //   newQuantity = 1;
    // }
    this.selectedProducts.map(x => {
      if (x.product.id === element.product.id) {
        x.quantity = newQuantity;
      }
      return x;
    });
    this.transfersDatasource = new MatTableDataSource<{ quantity: number; product: StockModel, amount: number }>(this.selectedProducts);
    this.updateTotalCost();
  }

  updateAmount(element: { amount: number, product: StockModel }, $event: Event): void {
    // @ts-ignore
    const newAmount = Number($event.target.value);

    this.selectedProducts.map(x => {
      if (x.product.id === element.product.id) {
        x.amount = newAmount;
      }
      return x;
    });
    this.transfersDatasource = new MatTableDataSource<{ quantity: number; product: StockModel, amount: number }>(this.selectedProducts);
    this.updateTotalCost();
  }
}
