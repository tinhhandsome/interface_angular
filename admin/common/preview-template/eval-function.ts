import { Component, ViewEncapsulation, Injector } from "@angular/core";
import * as moment from 'moment';
import { Encoder, QRByte, QRKanji, ErrorCorrectionLevel } from '@nuintun/qrcode';
import { ReportTable } from "@shared/service-proxies/service-proxies";

export class EvalFunctionComponent {
    constructor(
        injector: Injector,
    ) {
    }
    formatDate(m: string) {
        if (!m) {
            return '';
        }
        return moment(m).format("DD/MM/YYYY");
    }
    formatMoney(num) {
        if (isNaN(num)) {
            return '';
        }
        if (num == 0) {
            return "0";
        }
        if (!num) {
            return '';
        }
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    SumByProperTy(tableName: string, propertyName: string, item: ReportTable[]): string {
        if (propertyName && tableName) {
            for (var value of item) {
                if (value.tableName == tableName) {
                    var sum = 0;
                    var colIndex = value.columns.findIndex(x => x.colName == propertyName);
                    for (var number of value.rows) {
                        sum += parseInt(number.cells[colIndex]);
                    }
                    if (isNaN(sum)) {
                        return '';
                    }
                    return sum.toString();
                }
            }
        }
        return "";
    }
    Single(tableName: string, propertyName: string, item: ReportTable[]): string {
        if (propertyName && tableName) {
            for (var value of item) {
                if (value.tableName == tableName) {
                    var colIndex = value.columns.findIndex(x => x.colName == propertyName);
                    if (value.rows.length > 0) {
                        return value.rows[0].cells[colIndex];
                    }
                }
            }
        }
        return "";
    }
    Sum(numbers): string {
        if (numbers && numbers.length > 0) {
            return numbers.reduce((a, b) => a + b);
        }
        return '';
    }
    genQRCode(data: string) {
        if (data) {
            const qrcode = new Encoder();
            qrcode.setEncodingHint(true);
            qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.L);
            qrcode.write(data);
            qrcode.make();
            return qrcode.toDataURL();
        }
        return '';
    }

    CountRow(tableName: string, item: ReportTable[]): string {
        if (tableName) {
            for (var value of item) {
                if (value.tableName == tableName) {
                    return value.rows.length.toString();
                }
            }
        }
        return "";
    }

    CountByCondition(propertyName: string, condition: string, item: ReportTable[]): string {
        if (propertyName && condition) {
            var propertyIndex = -1;
            for (var i = 0; i < item[0].columns.length; i++) {
                if (item[0].columns[i].keyName == propertyName) {
                    propertyIndex = i;
                    break;
                }
            }
            if(propertyIndex > -1){
                var evalString = 'item[0].rows.filter(x=>x.cells[' + propertyIndex + ']' + condition + ').legth';
                return eval(evalString);
            }
        }
        return '';
    }
}