import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {StockState} from '../states/stock.state';
import {InvoiceItemModel} from '../models/invoice-item.model';
import {InvoiceCartState} from '../states/invoice-cart.state';

@Component({
  selector: 'app-add-to-invoice-cart-form',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="dialog-header-line"></div>
      </div>
      <form class="inputs-container" [formGroup]="addToCartForm" (ngSubmit)="addToCart()">
        <div class="input-container">
          <p class="input-head">Quantities</p>
          <input formControlName="quantity" type="number" class="input-body">
          <mat-error *ngIf="addToCartForm.get('quantity').invalid">
            Quantity required and must be greater that zero
          </mat-error>
        </div>
        <div class="input-container">
          <p class="input-head">Price</p>
          <input formControlName="amount" type="number" class="input-body">
          <mat-error *ngIf="addToCartForm.get('amount').invalid">
            Price required and must be positive number
          </mat-error>
        </div>
<!--        <div class="input-container">-->
<!--          <p class="input-head">New retail price</p>-->
<!--          <input formControlName="retailPrice" type="number" class="input-body">-->
<!--          <mat-error *ngIf="addToCartForm.get('retailPrice').invalid">-->
<!--            Retail price required and must be positive number-->
<!--          </mat-error>-->
<!--        </div>-->
<!--        <div class="input-container">-->
<!--          <p class="input-head">New wholesale price</p>-->
<!--          <input formControlName="wholesalePrice" type="number" class="input-body">-->
<!--          <mat-error *ngIf="addToCartForm.get('wholesalePrice').invalid">-->
<!--            Wholesale price required and must be positive number-->
<!--          </mat-error>-->
<!--        </div>-->

        <!--        <div *ngIf="product.canExpire" class="input-container">-->
        <!--          <p class="input-head">Expire date</p>-->
        <!--          <input formControlName="expire" type="number" class="input-body">-->
        <!--        </div>-->

<!--        <mat-form-field *ngIf="product.canExpire" appearance="outline">-->
<!--          <mat-label class="input-head">Expire date</mat-label>-->
<!--          <input matInput formControlName="expire" [matDatepicker]="picker">-->
<!--          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>-->
<!--          <mat-datepicker #picker></mat-datepicker>-->
<!--&lt;!&ndash;          <mat-error>Payment date required</mat-error>&ndash;&gt;-->
<!--        </mat-form-field>-->

        <div class="input-container">
          <button color="primary" [disabled]="addToCartForm.invalid"
                  mat-flat-button
                  class="add-button add-button-text">
            Add to cart [ {{addToCartForm.value.quantity * addToCartForm.value.amount | number}} ]
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class AddToInvoiceCartFormComponent implements OnInit {
  addToCartForm: UntypedFormGroup;
  @Input() product: StockModel;
  @Output() done = new EventEmitter();

  constructor(private readonly invoiceCartState: InvoiceCartState,
              private readonly stockState: StockState,
              private readonly formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.addToCartForm = this.formBuilder.group({
      quantity: ['', [Validators.required, Validators.nullValidator, Validators.min(1)]],
      amount: [this.product.retailPrice, [Validators.required, Validators.nullValidator, Validators.min(0)]],
    });
  }

  addToCart() {
    const invoiceItem: InvoiceItemModel = {
      amount: this.addToCartForm.value.amount * this.addToCartForm.value.quantity,
      stock: {
        purchase: this.product.purchase,
        product: this.product.product,
        id: this.product.id,
        category: this.product?.category,
        stockable: !!this.product.stockable,
        supplier: this.product?.supplier,
        unit: this.product?.unit
      },
      quantity: this.addToCartForm.value.quantity
    };
    this.invoiceCartState.addToCart(invoiceItem);
    this.done.emit('done');
  }
}
