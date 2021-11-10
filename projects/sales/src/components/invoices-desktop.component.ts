import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-invoices-desktop',
  template: `
    <app-invoices-table-options (paginator)="setP($event)"></app-invoices-table-options>
    <app-invoices-table *ngIf="p" [paginator]="p"></app-invoices-table>
  `,
  styleUrls: []
})
export class InvoicesDesktopComponent implements OnInit, OnDestroy{
  p: MatPaginator;
  constructor() {
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

  setP($event: MatPaginator) {
    this.p = $event;
  }
}
