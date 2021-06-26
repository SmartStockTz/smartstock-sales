import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {StockModel} from '../models/stock.model';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';

// @dynamic
@Component({
  selector: 'app-add-to-cart-sheet',
  template: `
    <mat-card class="mat-elevation-z0">
      <mat-card-content>
        <button mat-icon-button (click)="close()" style="margin: 0;padding: 0;float: right;">
          <mat-icon color="warn">close</mat-icon>
        </button>
        <p>
            <span style="font-weight: 500;">
              {{(data?.isViewedInWholesale ? data?.stock.wholesalePrice : data?.stock.retailPrice)  | number}}
            </span>
          <br>
          <span style="color: gray;">{{data?.stock.product}}</span>
        </p>
        <p style="display: flex;flex-direction: row;">
          <label style="padding-top: 10px;">Qty</label>
          <span style="display: flex;flex-direction: row;">
                <button mat-icon-button color="primary" (click)="data?.decrementQty()">
                  <mat-icon>remove_circle</mat-icon>
                </button>
                <input autocomplete="false"
                       style="border: none; text-align: center;background-color: rgba(0, 170, 7, 0.1); border-radius: 4px;width: 100%;"
                       [formControl]="data?.quantityFormControl" type="number" min="1">
                <button mat-icon-button color="primary" (click)="data?.incrementQty()">
                  <mat-icon>add_circle</mat-icon>
                </button>
          </span>
        </p>
        <button class="btn-block" mat-flat-button color="primary" (click)="addToC()">Add to cart</button>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: []
})

export class AddToCartSheetComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(public readonly dialogRef: MatBottomSheetRef<AddToCartSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public readonly data: {
                stock: StockModel,
                isViewedInWholesale: boolean,
                quantityFormControl: FormControl,
                addToCart: (product: StockModel) => any,
                incrementQty: () => any,
                decrementQty: () => any
              }) {
  }

  async ngAfterViewInit(): Promise<void> {
  }

  async ngOnDestroy(): Promise<void> {
  }

  async ngOnInit(): Promise<void> {
  }

  async close(): Promise<any> {
    this.dialogRef.dismiss();
  }

  async addToC(): Promise<any> {
    this.data.addToCart(this.data?.stock);
    this.dialogRef.dismiss();
  }
}
