import { ReportInfo } from "@shared/service-proxies/service-proxies";


export class ReportTemplate {
    storeInfo = new ReportInfo();
    templateContent ='';

    constructor(storeInfo: ReportInfo, templateContent: string) {
        this.storeInfo = storeInfo;
        this.templateContent = templateContent;
    }
}