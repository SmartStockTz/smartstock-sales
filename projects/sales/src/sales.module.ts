import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CartComponent} from './components/cart.component';
import {ProductComponent} from './components/product.component';
import {RetailPageComponent} from './pages/retail.page';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatBadgeModule} from '@angular/material/badge';
import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatListModule} from '@angular/material/list';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {SaleComponent} from './components/sale.component';
import {CartPreviewComponent} from './components/cart-preview.component';
import {RouterModule, ROUTES, Routes} from '@angular/router';
import {WholePageComponent} from './pages/whole.page';
import {LibModule} from '@smartstocktz/core-libs';
import {IndexPage} from './pages/index.page';
import {OrderPage} from './pages/order.page';
import {OrdersTableComponent} from './components/orders-table.component';
import {CdkTableModule} from '@angular/cdk/table';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatChipsModule} from '@angular/material/chips';
import {OrdersTableActionsComponent} from './components/orders-table-actions.component';
import {OrderPaymentStatusComponent} from './components/order-payment-status.component';
import {OrdersTableOptionsComponent} from './components/orders-table-options.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {OrdersTableShowItemsComponent} from './components/orders-table-show-items.component';
import {ConfigsService} from './services/config.service';
import {MatExpansionModule} from '@angular/material/expansion';
import {VerifyEMailDialogComponent} from './user-modules/verify-dialog.component';
import {MobilePayDetailsComponent} from './user-modules/mobile-pay-details.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {PayByCreditPageComponent} from './pages/pay_by_credit.page';
import {PayByInvoicesComponent} from './pages/pay_by_invoices.page';
import {CreateCreditorComponent} from './components/create-creditor.component';
import {SaleByCreditCreateFormComponent} from './components/create-sale-by-credit-form.component';
import {ProductSearchDialogComponent} from './components/product-search.component';
import {InfoDialogComponent} from './components/info-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import {InvoicesPageComponent} from './pages/invoices.page';
// import { InvoicesListComponent } from './components/invoices-list.component';
import {CreateCustomerComponent} from './components/create-customer-form.component';
import {MatMenuModule} from '@angular/material/menu';
import {IncompleteInvoicesTableComponent} from './components/incomplete-invoices-table.component';
import {InvoiceDetailsComponent} from './components/invoice-details.component';
import {AddReturnSheetComponent} from './components/add-returns-sheet.component';
import {CustomersPage} from './pages/customers.page';
import {CustomerListComponent} from './components/customer-list.component';


const routes: Routes = [
  {path: '', component: IndexPage},
  {path: 'order', component: OrderPage},
  {path: 'customers', component: CustomersPage},
  {path: 'whole', component: WholePageComponent},
  {path: 'retail', component: RetailPageComponent},
  {path: 'invoices', component: PayByCreditPageComponent},
  {path: 'invoices/create', component: PayByInvoicesComponent},
  {path: 'invoices/list', component: InvoicesPageComponent}
];

@NgModule({
  imports: [
    CommonModule,
    {
      ngModule: RouterModule,
      providers: [
        {
          provide: ROUTES,
          multi: true,
          useValue: routes
        }
      ]
    },
    LibModule,
    MatSortModule,
    MatMenuModule,
    MatSelectModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatSortModule,
    MatTooltipModule,
    MatToolbarModule,
    MatBadgeModule,
    MatRippleModule,
    MatListModule,
    ScrollingModule,
    FormsModule,
    CdkTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatExpansionModule,
    MatSnackBarModule
  ],
  declarations: [
    CustomerListComponent,
    CustomersPage,
    AddReturnSheetComponent,
    IncompleteInvoicesTableComponent,
    CreateCustomerComponent,
    InvoicesPageComponent,
    InvoiceDetailsComponent,
    InfoDialogComponent,
    ProductSearchDialogComponent,
    SaleByCreditCreateFormComponent,
    CreateCreditorComponent,
    PayByInvoicesComponent,
    PayByCreditPageComponent,
    OrdersTableShowItemsComponent,
    OrdersTableOptionsComponent,
    OrderPaymentStatusComponent,
    OrdersTableActionsComponent,
    IndexPage,
    OrderPage,
    OrdersTableComponent,
    WholePageComponent,
    CartComponent,
    ProductComponent,
    RetailPageComponent,
    SaleComponent,
    CartPreviewComponent,
    VerifyEMailDialogComponent,
    MobilePayDetailsComponent
  ], entryComponents: [
    InvoiceDetailsComponent
  ]
})
export class SalesModule {
  static start(config: { android: boolean, electron: boolean, browser: boolean, production: boolean } = {
                 android: false,
                 electron: false,
                 browser: true,
                 production: true
               },
               smartstock: { databaseURL: string, functionsURL: string } = {databaseURL: '', functionsURL: ''},
               printerUrl: string = ''): void {
    ConfigsService.android = config.android;
    ConfigsService.electron = config.electron;
    ConfigsService.browser = config.browser;
    ConfigsService.production = config.browser;
    ConfigsService.smartstock = smartstock;
    ConfigsService.printerUrl = printerUrl;
  }
}
