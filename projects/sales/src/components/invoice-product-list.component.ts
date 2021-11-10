import {Component, OnDestroy, OnInit} from '@angular/core';
import {StockState} from '../states/stock.state';

@Component({
  selector: 'app-invoice-product-list',
  template: `
    <app-on-fetch [isLoading]="(stockState.isFetchStocks | async)==true"
                  *ngIf="(stockState.isFetchStocks | async)==true">
    </app-on-fetch>
    <cdk-virtual-scroll-viewport style="height: 90vh"
                                 *ngIf="(stockState.isFetchStocks | async) === false"
                                 itemSize="'80'">
      <mat-nav-list>
        <app-invoice-product-list-item [stock]="product"
                               *cdkVirtualFor="let product of stockState.stocks.connect() | async;">
        </app-invoice-product-list-item>
      </mat-nav-list>
    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: []
})

export class InvoiceProductListComponent implements OnInit, OnDestroy {

  constructor(public readonly stockState: StockState) {
  }

  async ngOnInit(): Promise<void> {
    this.stockState.getStocks();
  }

  ngOnDestroy(): void {
  }
}
