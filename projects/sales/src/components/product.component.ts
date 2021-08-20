import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatSidenav} from '@angular/material/sidenav';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DeviceState} from '@smartstocktz/core-libs';
import {StockModel} from '../models/stock.model';
import {CartState} from '../states/cart.state';
import {ProductState} from '../states/product.state';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {AddToCartSheetComponent} from './add-to-cart-sheet.component';

@Component({
  selector: 'app-product-card',
  template: `
    <div>
      <div *ngIf="(deviceState.isSmallScreen | async ) === false"
           class='card-container' [ngClass]="{'flipped':productIndex == flipped}">
        <div class='flippable-card' [ngClass]="{'flipped':productIndex == flipped}">
          <mat-card class='front' style="text-align: center; width: 150px; height: 160px;" (click)='flip(productIndex)'>
            <mat-card-content>
              <p class="text-truncate" style="color: gray;">
                <b [ngClass]="instock ? 'text-success' : 'text-danger'">
                  {{instock ? 'IN' : 'OUT'}}
                </b>
                | {{stock.category}}
              </p>
              <p class="text-wrap"
                 matTooltip="{{stock.product}}"
                 style="font-weight: bold; overflow: hidden; height: 58px;">
                {{stock.product}}
              </p>
              <p class="text-wrap" style="font-weight: 500;">
                {{(isViewedInWholesale ? stock.wholesalePrice : stock.retailPrice)  | fedha | async}}
              </p>
            </mat-card-content>
          </mat-card>
          <mat-card *ngIf="productIndex===flipped" class='back'>
            <mat-card-content>
              <button mat-icon-button (click)="flip(-1)" style="margin: 0;padding: 0;float: right;">
                <mat-icon>close</mat-icon>
              </button>
              <p>
            <span style="font-weight: 500;">
              {{(isViewedInWholesale ? stock.wholesalePrice : stock.retailPrice)  | number}}
            </span>
                <br>
                <span style="color: gray;">{{stock.product}}</span>
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
                <button mat-flat-button color="primary" (click)="addToCart(stock)">Add</button>
              </p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div style="width: 95vw" *ngIf="(deviceState.isSmallScreen | async) === true">
        <mat-list-item style="width: 100%;" (click)='openSheet(productIndex)'>
          <mat-icon [ngClass]="instock ? 'text-success' : 'text-danger'" matListIcon>
            {{instock ? 'widgets' : 'widgets'}}
          </mat-icon>
          <p matLine class="text-wrap"
             matTooltip="{{stock.product}}"
             style="font-weight: bold;">
            {{stock.product}}
          </p>
          <p matLine class="text-truncate" style="color: gray;">
            {{stock.category}}
            | <span [ngClass]="instock ? 'text-success' : 'text-danger'">{{instock ? 'IN' : 'OUT'}}</span>
          </p>
          <p matLine class="text-wrap" style="font-weight: 500;">
            {{(isViewedInWholesale ? stock.wholesalePrice : stock.retailPrice)  | fedha | async}}
          </p>
        </mat-list-item>
      </div>
    </div>
  `,
  styleUrls: ['../styles/product.style.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  @Input() stock: StockModel;
  @Input() productIndex: number;
  @Input() isViewedInWholesale = false;
  @Input() cartdrawer: MatSidenav;
  @Output() afterAddToCart = new EventEmitter();

  detailView = false;
  quantityFormControl = new FormControl(1, [Validators.nullValidator, Validators.min(1)]);
  flipped: number;
  fdestroy: Subject<any> = new Subject();
  instock = true;

  constructor(public readonly cartState: CartState,
              public readonly deviceState: DeviceState,
              public readonly productState: ProductState,
              public readonly sheet: MatBottomSheet,
              public readonly snack: MatSnackBar) {
  }

  async ngOnDestroy(): Promise<void> {
    this.fdestroy.next('done');
  }

  async ngOnInit(): Promise<void> {
    if (this.stock && this.stock.stockable === true && this.stock.quantity > 0) {
      this.instock = true;
    } else if (this.stock && this.stock.stockable === true && this.stock.quantity <= 0) {
      this.instock = false;
    } else if (this.stock && this.stock.stockable === false) {
      this.instock = true;
    } else {
      this.instock = true;
    }
    this.instock = this.stock.stockable === true && this.stock.quantity > 0 || this.stock.stockable === false;
    this.productState.flipped.pipe(
      takeUntil(this.fdestroy)
    ).subscribe(value => {
      this.flipped = value;
    });
  }

  async flip(value: number): Promise<void> {
    this.productState.flipped.next(value);
  }

  async decrementQty(): Promise<void> {
    if (this.quantityFormControl.value > 0) {
      this.quantityFormControl.setValue(this.quantityFormControl.value - 1);
    }
  }

  async incrementQty(): Promise<void> {
    this.quantityFormControl.setValue(this.quantityFormControl.value + 1);
  }

  async addToCart(product: StockModel): Promise<void> {
    if (!this.quantityFormControl.valid) {
      this.snack.open('Quantity must be greater than 1', 'Ok', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }
    const quantity = this.quantityFormControl.value;
    this.cartState.addToCart({product, quantity});
    if (this.deviceState.enoughWidth.value === true) {
      this.cartdrawer.opened = true;
    }
    this.afterAddToCart.emit();
    this.quantityFormControl.reset(1);
    this.detailView = false;
    this.productState.flipped.next(-1);
  }

  async openSheet(_12: number): Promise<any> {
    this.sheet.open(AddToCartSheetComponent, {
      data: {
        stock: this.stock,
        isViewedInWholesale: this.isViewedInWholesale,
        quantityFormControl: this.quantityFormControl,
        addToCart: (s) => this.addToCart(s),
        incrementQty: () => this.incrementQty(),
        decrementQty: () => this.decrementQty()
      }
    });
  }
}
