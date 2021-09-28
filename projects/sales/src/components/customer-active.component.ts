import {Component, Input, OnInit} from '@angular/core';
import {CustomerModel, LibUserModel, UserService} from '@smartstocktz/core-libs';
import {of} from 'rxjs';

@Component({
  selector: 'app-customer-active',
  template: `
    <div *ngIf="currentUser" style="display: inline-block">
      <div style="background: green; border-radius: 20px; width: 10px; height: 10px;display: inline-block" *ngIf="verified | async"></div>
      <div style="background: red; border-radius: 20px; width: 20px; height: 10px; display: inline-block" *ngIf="verified | async"></div>
    </div>
  `,
  styleUrls: []
})
export class CustomerActiveComponent implements OnInit {
  @Input() customer: CustomerModel;
  currentUser: LibUserModel;
  verified = of(true);

  constructor(private readonly userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.currentUser().then(value => {
      if (value.id === 'smartstock-hq') {
        // @ts-ignore
        this.verified = of(this.customer.verified);
      } else {
        this.verified = of(true);
      }
      this.currentUser = value;
    }).catch(reason => {
      console.log(reason);
      this.verified = of(true);
    });
  }
}
