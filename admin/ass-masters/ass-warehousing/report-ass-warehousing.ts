import * as moment from 'moment';

export class ReportAssWarehousing {
    branhId = "";
    branchName = "";
    branchLogin = "";
    level = "ALL";
    departmentId = '';
    exportDate: any;
    reportStatus = '';

    constructor() {
        this.exportDate = moment();
    }
}