import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, ReportTemplateServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { IUiAction } from "@app/ultilities/ui-action";
import * as moment from 'moment';
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import { ReportAssWarehousing } from "./report-ass-warehousing";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './ass-warehousing.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssWarehousingComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<ReportAssWarehousing>  {
    @ViewChild('reportForm') reportForm: ElementRef;
    // @ViewChild('previewTemplateModal') previewTemplateModal: ReportTemplateModalComponent;

    isShowError: boolean = false;    hidden: boolean = false;
    inputModel: ReportAssWarehousing;
    onAdd(): void {
    }
    onUpdate(item: ReportAssWarehousing): void {
    }
    onDelete(item: ReportAssWarehousing): void {
    }
    onApprove(item: ReportAssWarehousing): void {
    }
    onViewDetail(item: ReportAssWarehousing): void {
    }
    onSave(): void {
    }
    onSearch(): void {
    }
    onResetSearch(): void {
    }
    ngAfterViewInit(): void {
        this.setupValidationMessage();
        // COMMENT: this.stopAutoUpdateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private _branchService: BranchServiceProxy,
        private _previewTemplateService: PreviewTemplateService) {
        super(injector);
        this.initFilter();
        this.inputModel = new ReportAssWarehousing();
        this.inputModel.branchLogin = this.appSession.user.subbrId;
        this.inputModel.reportStatus = 'N,I';
    }

    initFilter() {

    }


    ngOnInit(): void {
        // this.appToolbar.setRole('AssWarehousing', false, false, false, false, false, false, false, false);
        this._branchService.cM_BRANCH_ById(this.appSession.user.subbrId).subscribe(response => {
            this.onSelectBranch(response);
        });

        // this.appToolbar.setEnableForEditPage();
        // this.appToolbar.setUiAction(this);

    }


    exportToExcel() {
        if ((this.reportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.parameters = [];
        var date = moment();
        reportInfo.values = [];

        reportInfo.values.push(this.GetParamNameAndValue("A3", "ĐƠN VỊ: " + this.inputModel.branchName));
        reportInfo.values.push(this.GetParamNameAndValue("A6", "Ngày " + date.date() + " tháng " + (date.month() + 1) + " năm " + date.year()));

        reportInfo.parameters = [];
        reportInfo.parameters.push(this.GetParamNameAndValue("DATE", moment(this.inputModel.exportDate, 'DD/MM/YYYY').format('DD/MM/YYYY')));
        reportInfo.parameters.push(this.GetParamNameAndValue("BRANCH_LOGIN", this.appSession.user.subbrId));
        reportInfo.parameters.push(this.GetParamNameAndValue("BRANCH_ID", this.inputModel.branhId));
        reportInfo.parameters.push(this.GetParamNameAndValue("LEVEL", "ALL"));
        reportInfo.parameters.push(this.GetParamNameAndValue("DEP_ID", this.inputModel.departmentId));
        reportInfo.parameters.push(this.GetParamNameAndValue("REPORT_STATUS", this.inputModel.reportStatus));

        reportInfo.pathName = "/ASS_MASTER/TSCD_BC16A.xlsx";
        reportInfo.storeName = "rpt_TSCD_BC016_1";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.isShowError = false;
            this.updateView();
        });
    }
    onSelectBranch(event: CM_BRANCH_ENTITY) {
        if (!event.fatheR_ID) {
            this.hidden = false;
        }
        else {
            this.hidden = true;
        }
        this.inputModel.branchName = event.brancH_NAME;
        this.inputModel.branhId = event.brancH_ID;
        this.updateView();
    }
    
    printPreview() {
        if ((this.reportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        var date = moment();
        var values = [];

        values.push(this.GetParamNameAndValue("branchCode", this.appSession.user.branchCode));

        values.push(this.GetParamNameAndValue("branchName", this.appSession.user.branchName));

        values.push(this.GetParamNameAndValue("ReportDate", "Ngày " + date.date() + " tháng " + (date.month() + 1) + " năm " + date.year()));
        values.push(this.GetParamNameAndValue("UserName", this.appSession.user.name));
        values.push(this.GetParamNameAndValue("PrintDate", moment(this.inputModel.exportDate, 'DD/MM/YYYY').format('DD/MM/YYYY')));
        values.push(this.GetParamNameAndValue("ReportCode", "TSCD_BC16B"));

        var parameters = [];
        parameters.push(this.GetParamNameAndValue("DATE", moment(this.inputModel.exportDate, 'DD/MM/YYYY').format('DD/MM/YYYY')));
        parameters.push(this.GetParamNameAndValue("BRANCH_LOGIN", this.appSession.user.subbrId));
        parameters.push(this.GetParamNameAndValue("BRANCH_ID", this.inputModel.branhId));
        parameters.push(this.GetParamNameAndValue("LEVEL", "ALL"));
        parameters.push(this.GetParamNameAndValue("DEP_ID", this.inputModel.departmentId));
        parameters.push(this.GetParamNameAndValue("REPORT_STATUS", this.inputModel.reportStatus));


        this._previewTemplateService.printReportTemplate("TSCD_BC16A", parameters, values);
        // this.previewTemplateModal.show("TSCD_BC16A", parameters, values);
    }

}
