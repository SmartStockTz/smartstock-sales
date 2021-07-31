import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

// @dynamic
@Component({
  selector: 'app-delete-confirm-dialog',
  template: `
    <div>
      <div mat-dialog-title>{{data?.title}}</div>
      <p mat-dialog-content>
        {{data.body}}
      </p>
      <div style="display: flex; justify-content: center; align-items: center" mat-dialog-actions>
        <button (click)="dialogRef.close(null)" mat-button>Cancel</button>
        <span style="flex: 1 1 auto"></span>
        <button (click)="dialogRef.close('proceed')" mat-button color="primary">Proceed</button>
      </div>
    </div>
  `,
  styleUrls: []
})

export class DeleteConfirmDialogComponent {
  constructor(public readonly dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public readonly data: {
                title: string,
                body: string
              }) {
  }
}
