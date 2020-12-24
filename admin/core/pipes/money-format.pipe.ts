import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'moneyFormatPipe',
})
export class MoneyFormatPipe implements PipeTransform {
    transform(num: number) {
        if (num == 0) {
            return '0';
        }
        if (!num) {
            return '';
        }
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
}