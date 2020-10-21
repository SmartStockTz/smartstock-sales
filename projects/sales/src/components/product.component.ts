import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatSidenav} from '@angular/material/sidenav';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DeviceInfoUtil, EventService} from '@smartstocktz/core-libs';
import {StockModel} from '../models/stock.model';
import {CartState} from '../states/cart.state';

@Component({
  selector: 'smartstock-product-card',
  template: `
    <div>
      <div class='card-container' [ngClass]="{'flipped':productIndex == flipped}">
        <div class='flippable-card' [ngClass]="{'flipped':productIndex == flipped}">
          <mat-card class='front' style="text-align: center; width: 150px; height: 160px;" (click)='flip(productIndex)'>
            <mat-card-content>
              <p style="color: gray;">{{product.category}}</p>
              <p matTooltip="{{product.product}}"
                 style="font-weight: bold;overflow: hidden; height: 46px;">{{product.product}}</p>
              <p style="font-weight: 500;">
                {{(isViewedInWholesale ? product.wholesalePrice : product.retailPrice)  | number}}
              </p>
            </mat-card-content>
          </mat-card>
          <mat-card *ngIf="productIndex===flipped" class='back'>
            <mat-card-content>
              <button mat-icon-button (click)="flipped = null" style="margin: 0;padding: 0;float: right;">
                <mat-icon>close</mat-icon>
              </button>
              <p>
            <span style="font-weight: 500;">
              {{(isViewedInWholesale ? product.wholesalePrice : product.retailPrice)  | number}}
            </span><br>
                <span style="color: gray;">{{product.product}}</span>
              </p>
              <p style="display: flex;flex-direction: row;">
                <label style="padding-top: 10px;">Qty</label>
                <span style="display: flex;flex-direction: row;">
                <button mat-icon-button color="primary" (click)="decrementQty()">
                  <mat-icon>remove_circle</mat-icon>
                </button>
                <input autocomplete="false"
                       style="border: none; text-align: center;background-color: rgba(0, 170, 7, 0.1); border-radius: 4px;width: 50%;"
                       [formControl]="quantityFormControl" type="number" min="1">
                <button mat-icon-button color="primary" (click)="incrementQty()">
                  <mat-icon>add_circle</mat-icon>
                </button>
            </span>
                <button mat-flat-button color="primary" (click)="addToCart(product)">Add</button>
              </p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../styles/product.style.css']
})
export class ProductComponent extends DeviceInfoUtil implements OnInit {
  @Input() product: StockModel;
  @Input() productIndex: number;
  @Input() isViewedInWholesale = false;
  @Input() cartdrawer: MatSidenav;
  @Output() afterAddToCart = new EventEmitter();

  detailView = false;
  quantityFormControl = new FormControl(1, [Validators.nullValidator, Validators.min(1)]);

  flipped: number;

  constructor(private readonly eventService: EventService,
              private readonly cartState: CartState,
              private readonly snack: MatSnackBar) {
    super();
  }

  ngOnInit(): void {
  }

  flip(value): void {
    this.eventService.listen('flipping', (data) => {
      this.flipped = data.detail;
    });
    this.eventService.broadcast('flipping', value);
  }

  decrementQty(): void {
    if (this.quantityFormControl.value > 0) {
      this.quantityFormControl.setValue(this.quantityFormControl.value - 1);
    }
  }

  incrementQty(): void {
    this.quantityFormControl.setValue(this.quantityFormControl.value + 1);
  }

  addToCart(product: StockModel): void {
    if (!this.quantityFormControl.valid) {
      this.snack.open('Quantity must be greater than 1', 'Ok', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }
    const quantity = this.quantityFormControl.value;
    this.cartState.addToCart({product, quantity});
    if (this.enoughWidth()) {
      this.cartdrawer.opened = true;
    }
    this.afterAddToCart.emit();
    this.quantityFormControl.reset(1);
    this.detailView = false;
    this.flipped = null;
  }
}
