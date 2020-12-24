import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { Component, Injector, Optional, Inject } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { ReportInfo, AsposeServiceProxy, API_BASE_URL } from "@shared/service-proxies/service-proxies";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { HttpClient } from "@angular/common/http";
import * as moment from 'moment';

@Component({
    templateUrl: './aspose-sample.component.html',
    animations: [appModuleAnimation()]
})
export class AsposeSampleComponent extends DefaultComponentBase {
    baseUrl : string;
    constructor(injector: Injector,
        private http : HttpClient,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService
    ) {
        super(injector);
        this.baseUrl = injector.get(API_BASE_URL);
    }

    branchName : string;

    downloadBranchWord() {
        var reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Word;

        reportInfo.parameters = [
            this.GetParamNameAndValue("branchName", this.branchName)
        ];

        reportInfo.values = [
            this.GetParamNameAndValue("Title", "Tiêu đề report data"),
            this.GetParamNameAndValue("ds", "2019/03/01"),
            this.GetParamNameAndValue("p_ToDate", "Johny Cate")
        ];

        reportInfo.pathName = "/CM_BRANCH/rpt_branch.docx";
        reportInfo.storeName = "CM_BRANCH_RPT";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    downloadBranchPdf() {
        var reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Pdf;

        reportInfo.parameters = [
            this.GetParamNameAndValue("branchName", this.branchName)
        ];

        reportInfo.values = [
            this.GetParamNameAndValue("Title", "Tiêu đề report data"),
            this.GetParamNameAndValue("ds", "2019/03/01"),
            this.GetParamNameAndValue("p_DateReport", "Johny Cate")
        ];

        reportInfo.pathName = "/CM_BRANCH/rpt_branch.docx";
        reportInfo.storeName = "CM_BRANCH_RPT";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    downloadBranchExcel() {
        var reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.parameters = [
            this.GetParamNameAndValue("branchName", this.branchName),
            this.GetParamNameAndValue("value", 3),
        ];

        reportInfo.values = [
            this.GetParamNameAndValue("Title", "Tiêu đề report data"),
            this.GetParamNameAndValue("p_NUM", 1235674543),
            this.GetParamNameAndValue("p_DateReport", moment())
        ];

        reportInfo.pathName = "/CM_BRANCH/rpt_branch.xlsx";
        reportInfo.storeName = "CM_BRANCH_RPT";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
}