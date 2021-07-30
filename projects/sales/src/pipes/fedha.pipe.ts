import {Pipe, PipeTransform} from '@angular/core';
import {formatNumber} from '@angular/common';
import {UserService} from '@smartstocktz/core-libs';

@Pipe({
  name: 'fedha'
})
export class FedhaPipe implements PipeTransform {


  constructor(private readonly userService: UserService) {
  }

  async transform(value: any, ...args: any[]): Promise<string> {
    if (Number.isNaN(value)) {
      return value;
    }
    const c = await this.userService.getCurrentShop();
    return `${c && c?.settings?.currency ? c.settings.currency : 'Tsh'} ${formatNumber(value, 'en-US')}`;
  }

}
