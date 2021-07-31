import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-new-order',
  template: `
    <div class="cash-container">
      <div class="handler-container">
        <div class="handler"></div>
      </div>
      <mat-nav-list>
        <mat-list-item (click)="dialogRef.close()" routerLink="/sale/retail">
          <p matLine>Order from retail</p>
          <mat-icon matListIcon>add</mat-icon>
        </mat-list-item>
        <mat-list-item (click)="dialogRef.close()" routerLink="/sale/whole">
          <p matLine>Order from wholesale</p>
          <mat-icon matListIcon>add</mat-icon>
        </mat-list-item>
      </mat-nav-list>
    </div>
  `,
  styleUrls: ['../styles/cash-sale.style.css']
})

export class DialogNewOrderComponent {
  constructor(public readonly dialogRef: MatDialogRef<DialogNewOrderComponent>,
              @Inject(MAT_DIALOG_DATA) public readonly data: any) {
  }
}
