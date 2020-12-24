import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'termFormatPipe',
})
export class TermFormatPipe implements PipeTransform {
    
    getDateFormatString(){
        return 'MM/YYYY';
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