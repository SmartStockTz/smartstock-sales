import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {UtilsService} from '../services/utils.service';
import {MatSidenav} from '@angular/material/sidenav';
import {CartState} from '../states/cart.state';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-cart-preview',
  template: `
    <div style="padding: 16px" [ngClass]="isMobile?'fixed-bottom':!deviceState.enoughWidth.value?'fixed-bottom-web-enough-width':'fixed-bottom-web'"
         *ngIf="(cartState.carts | async).length  > 0">
      <button (click)="showMainCart()" mat-flat-button class="ft-button" color="primary">
        {{totalItems | number}} Items = {{totalCost | fedha | async}}
      </button>
    </div>
  `,
  styleUrls: ['../styles/cart-preview.style.css'],
  providers: [
    UtilsService
  ]
})
export class CartPreviewComponent implements OnInit {
  totalCost = 0;
  totalItems = 0;
  @Input() isWholeSale = false;
  @Input() cartSidenav: MatSidenav;
  isMobile = false;

  constructor(public readonly cartState: CartState,
              public readonly deviceState: DeviceState,
              private readonly changeDetectorRef: ChangeDetectorRef,
              private readonly utilsService: UtilsService) {
  }

  ngOnInit(): void {
    this._cartEventsListen();
  }

  private _cartEventsListen(): void {
    this.cartState.carts.subscribe(value => {
      this.totalCost = this.utilsService.findTotalCartCost(value, this.isWholeSale);
      this.totalItems = value.map(x => x.quantity).reduce((a, b) => a + b, 0);
    });
  }

  showMainCart(): void {
    this.cartSidenav.opened = true;
  }
}
