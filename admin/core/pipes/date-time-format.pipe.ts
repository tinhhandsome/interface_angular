import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'dateTimeFormatPipe',
})
export class DateTimeFormatPipe implements PipeTransform {
    
    getDateFormatString(){
        return 'DD/MM/YYYY, h:mm:ss a';
    }

    momentToString(m : moment.Moment){
        return moment(m).format(this.getDateFormatString());
    }

    transform(value: moment.Moment) {
        if (!value) {
            return '';
        }
        return this.momentToString(value);
    }
}