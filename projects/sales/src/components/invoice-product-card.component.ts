import {Component, Input} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {MatDialog} from '@angular/material/dialog';
import {AddToInvoiceCartDialogComponent} from './add-to-invoice-cart-dialog.component';

@Component({
  selector: 'app-credit-product-card',
  template: `
    <div class='card-container'>
      <div class='flippable-card'>
        <mat-card matRipple class='front' (click)='flip()'>
          <mat-card-content>
            <p class="text-truncate" style="color: gray;">
              {{stock.category}}
            </p>
            <p class="text-wrap"
               matTooltip="{{stock.product}}"
               style="font-weight: bold; overflow: hidden; height: 58px;">
              {{stock.product}}
            </p>
            <p class="text-truncate" style="color: gray;">
              {{stock.supplier}}
            </p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['../styles/credit-product-card.style.scss']
})
export class InvoiceProductCardComponent {
  @Input() stock: StockModel;

  constructor(private readonly dialog: MatDialog) {
  }

  flip() {
    this.dialog.open(AddToInvoiceCartDialogComponent, {
      closeOnNavigation: true,
      width: '500px',
      data: this.stock
    });
  }
}
