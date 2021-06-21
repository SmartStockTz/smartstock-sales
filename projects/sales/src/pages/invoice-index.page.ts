import {Component, OnDestroy, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  template: `
    <mat-sidenav-container>
      <mat-sidenav class="match-parent-side"
                   #sidenav
                   [mode]="(deviceState.enoughWidth | async)===true?'side': 'over'"
                   [opened]="(deviceState.enoughWidth | async)===true">
        <app-drawer></app-drawer>
      </mat-sidenav>
      <mat-sidenav-content style="min-height: 100vh">
        <app-toolbar searchPlaceholder="Filter orders" [showSearch]="false"
                     (searchCallback)="onSearch($event)" [heading]="'Pay by Invoice'"
                     [sidenav]="sidenav"></app-toolbar>

        <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-10"
             style="padding: 16px 0; min-height: 100vh">
          <div class="d-flex flex-wrap">

            <app-libs-rbac [groups]="['*']">
              <ng-template>
                <div routerLink="/sale/invoices/create" style="margin: 5px; cursor: pointer">
                  <mat-card matRipple class="index-item">
                    <mat-icon color="primary" style="font-size: 60px; height: 60px; width: 60px">
                      shop
                    </mat-icon>
                  </mat-card>
                  <p>Create</p>
                </div>
              </ng-template>
            </app-libs-rbac>

            <app-libs-rbac [groups]="['*']">
              <ng-template>
                <div routerLink="/sale/invoices/list" style="margin: 5px; cursor: pointer">
                  <mat-card matRipple class="index-item">
                    <mat-icon color="primary" style="font-size: 60px; height: 60px; width: 60px">
                      shop
                    </mat-icon>
                  </mat-card>
                  <p>All Invoices</p>
                </div>
              </ng-template>
            </app-libs-rbac>

          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  selector: 'app-invoices-index',
  styleUrls: ['../styles/index.style.css']
})
export class InvoiceIndexPage implements OnInit, OnDestroy {

  constructor(public readonly deviceState: DeviceState) {
  }// end

  async ngOnInit(): Promise<any> {

  }

  async onSearch($event: string): Promise<void> {

  }

  async ngOnDestroy(): Promise<void> {
  }
}
