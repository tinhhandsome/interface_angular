import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_BRANCH_ENTITY, CAR_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './rpt-con-payment-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class BcConPaymentDetailComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    monthAndyear: any[];
    hidden: boolean = false;

    filterInput: any = {};
    years: any[];
    ngAfterViewInit(): void {
        this.updateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        // COMMENT: this.stopAutoUpdateView();
    }


    ngOnInit(): void {
        this.initCombobox();
        this.initModal();
        this.initFilter();
    }
    initCombobox() {
        this.years = this.getYearsCombobox();
        this.monthAndyear = this.getMonthAndYearCombobox();
    }
    initFilter() {
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput.brancH_NAME = this.appSession.user.branchName;
        this.filterInput.budget = moment().year();
        this.filterInput.REQ_DT = (moment().month() + 1) + '/' + moment().year();
    }
    initModal() {
        this.initBranchModal();
        this.initCarModal();
    }
    initBranchModal() {
    }
    initCarModal() {

    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        // if (this.filterInput.REQ_DT) {
        //     this.filterInput.REQ_DT = '1/' + this.filterInput.REQ_DT;

        // } 
        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = [];
        if (this.filterInput.REQ_DT) {
            reportInfo.values.push(this.GetParamNameAndValue("A3", "KẾ HOẠCH THANH TOÁN CÁC CÔNG TRÌNH XDCB THÁNG " + this.filterInput.REQ_DT));

        }
        else {
            reportInfo.values.push(this.GetParamNameAndValue("A3", "KẾ HOẠCH THANH TOÁN CÁC CÔNG TRÌNH XDCB"));

        }

        reportInfo.pathName = "/REPORT/CON_REQ_PAYMENT_DETAIL.xlsx";
        reportInfo.storeName = "rpt_CON_REQUEST_PAYMENT_DT";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
        });
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        if (!branch) return;
        this.filterInput.brancH_ID = branch.brancH_ID;
        this.filterInput.brancH_NAME = branch.brancH_NAME;
        this.updateView();
    }


}