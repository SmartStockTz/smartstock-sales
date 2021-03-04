import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
// @dynamic
@Component({
  selector: 'app-stock-info-dialog',
  template: `
    <div>
      <h1 mat-dialog-title>Info</h1>
      <p mat-dialog-content>
        {{data.message}}
      </p>
      <div mat-dialog-actions>
        <div style="display: flex; flex-direction: row">
          <button mat-button color="warn" (click)="dialogRef.close(false)">Cancel</button>
          <div style="flex-grow: 1"></div>
          <button mat-button color="primary" (click)="dialogRef.close(true)">Continue</button>
        </div>
      </div>
    </div>
  `
})

export class InfoDialogComponent {

  constructor(public readonly dialogRef: MatDialogRef<InfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public readonly data: {
                message: string
              }) {
  }
}
