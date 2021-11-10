import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'ago'
})
export class AgoPipe implements PipeTransform {


  constructor() {
  }

  transform(value: any, ...args: any[]): string {
    if (value) {
      return moment(value).fromNow();
    } else {
      return 'N/A';
    }
  }

}
