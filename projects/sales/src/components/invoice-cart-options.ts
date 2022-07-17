import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-invoice-cart-options',
  template: `
    <div class="cash-container">
      <div class="handler-container">
        <div class="handler"></div>
      </div>
      <mat-nav-list>
        <mat-list-item (click)="saveOrder()">
          <p matLine>Save as profoma</p>
          <mat-icon matListIcon>save_alt</mat-icon>
        </mat-list-item>
        <!-- <mat-list-item (click)="printOnly()">
          <p matLine>Print cart only</p>
          <mat-icon matListIcon>print</mat-icon>
        </mat-list-item>
        <mat-list-item (click)="chooseDefaultPrinter()">
          <p matLine>Set default printer</p>
          <mat-icon matListIcon>print</mat-icon>
        </mat-list-item> -->
      </mat-nav-list>
    </div>
  `,
  styleUrls: ['../styles/cash-sale.style.css']
})

export class InvoiceCartOptions {
  @Output() done = new EventEmitter();

  constructor() {
  }

  saveOrder() {
    this.done.emit('profoma');
  }

  printOnly() {
    this.done.emit('print');
  }
  
  chooseDefaultPrinter(): void{
    this.done.emit('printer');
  }
}
