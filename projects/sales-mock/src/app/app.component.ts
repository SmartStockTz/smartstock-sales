import {Component} from '@angular/core';
import { startSalesSync } from './services/sales.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title = 'sales-mock';
  constructor(){
    startSalesSync();
  }
}
