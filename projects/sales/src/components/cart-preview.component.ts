import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {UtilsService} from '../services/utils.service';
import {MatSidenav} from '@angular/material/sidenav';
import {DeviceInfoUtil} from '@smartstocktz/core-libs';
import {CartState} from '../states/cart.state';

@Component({
  selector: 'app-cart-preview',
  template: `
    <div style="padding: 16px" [ngClass]="isMobile?'fixed-bottom':!enoughWidth()?'fixed-bottom-web-enough-width':'fixed-bottom-web'"
         *ngIf="(cartState.carts | async).length  > 0">
      <button (click)="showMainCart()" mat-flat-button class="ft-button" color="primary">
        {{totalItems | number}} Items = {{totalCost | currency: 'TZS '}}
      </button>
    </div>
  `,
  styleUrls: ['../styles/cart-preview.style.css'],
  providers: [
    UtilsService
  ]
})
export class CartPreviewComponent extends DeviceInfoUtil implements OnInit {
  totalCost = 0;
  totalItems = 0;
  @Input() isWholeSale = false;
  @Input() cartSidenav: MatSidenav;
  isMobile = false;

  constructor(public readonly cartState: CartState,
              private readonly changeDetectorRef: ChangeDetectorRef,
              private readonly utilsService: UtilsService) {
    super();
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
