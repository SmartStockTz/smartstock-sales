import {Component, Input} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {AddToInvoiceCartSheetComponent} from './add-to-invoice-cart-sheet.component';

@Component({
  selector: 'app-invoice-product-list-item',
  template: `
    <mat-list-item (click)='flip()'>
      <p style="width: 90vw; text-align: start" matLine class="text-wrap">{{stock.product}}</p>
      <mat-card-subtitle matLine class="text-truncate" style="color: gray;">
        {{stock.category}}
      </mat-card-subtitle>
    </mat-list-item>
  `,
  styleUrls: ['../styles/invoice-product.style.scss']
})
export class InvoiceProductListItemComponent {
  @Input() stock: StockModel;

  constructor(private readonly sheet: MatBottomSheet) {
  }

  flip() {
    this.sheet.open(AddToInvoiceCartSheetComponent, {
      closeOnNavigation: true,
      data: this.stock
    });
  }
}
