import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {RefundState} from '../states/refund.state';
import {FormControl} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-refund-body-header-mobile-component',
  template: `
    <div class="actions-container-mobile">
      <mat-form-field class="date-input-mobile" appearance="outline">
        <mat-label>Date</mat-label>
        <input [formControl]="dateControl" matInput [matDatepicker]="picker" [disabled]="true">
        <mat-datepicker-toggle matSuffix [for]="picker" [disabled]="false"></mat-datepicker-toggle>
        <mat-datepicker [disabled]="false" [touchUi]="true" #picker></mat-datepicker>
      </mat-form-field>
      <button (click)="hotReload()" color="primary" mat-icon-button>
        <mat-icon *ngIf="(refundState.loadSales | async)===false">play_arrow</mat-icon>
        <div class="progress-mobile" *ngIf="(refundState.loadSales | async)===true">
          <mat-progress-spinner mode="indeterminate"
                                [diameter]="20"
                                color="primary">
          </mat-progress-spinner>
        </div>
      </button>
    </div>
  `,
  styleUrls: ['../styles/refund-body.style.scss']
})

export class RefundBodyHeaderMobileComponent implements OnInit {
  dateControl = new FormControl(new Date());

  constructor(public readonly deviceState: DeviceState,
              public readonly refundState: RefundState) {
  }

  ngOnInit(): void {
    this.refundState.getSales(this.dateControl.value);
  }

  hotReload() {
    this.refundState.getSales(this.dateControl.value);
  }
}
