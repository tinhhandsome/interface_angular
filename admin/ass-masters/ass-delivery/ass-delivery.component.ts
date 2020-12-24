import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY, BranchServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { IUiAction } from "@app/ultilities/ui-action";
import * as moment from 'moment';
import { ReportAssDelivery } from "./report-ass-delivery";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './ass-delivery.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssDeliveryComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<CM_BRANCH_ENTITY>  {

    @ViewChild('reportForm') reportForm: ElementRef;
    // @ViewChild('previewTemplateModal') previewTemplateModal: ReportTemplateModalComponent;

    isShowError: boolean = false;
    hidden: boolean = false;
    inputModel: ReportAssDelivery;
    onAdd(): void {
        throw new Error("Method not implemented.");
    }
    onUpdate(item: CM_BRANCH_ENTITY): void {
        throw new Error("Method not implemented.");
    }
    onDelete(item: CM_BRANCH_ENTITY): void {
        throw new Error("Method not implemented.");
    }
    onApprove(item: CM_BRANCH_ENTITY): void {
        throw new Error("Method not implemented.");
    }
    onViewDetail(item: CM_BRANCH_ENTITY): void {
        throw new Error("Method not implemented.");
    }
    onSave(): void {
        throw new Error("Method not implemented.");
    }
    onSearch(): void {
        throw new Error("Method not implemented.");
    }
    onResetSearch(): void {
        throw new Error("Method not implemented.");
    }
    ngAfterViewInit(): void {
        this.setupValidationMessage();
        this.updateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private _branchService: BranchServiceProxy,
        private _previewTemplateService: PreviewTemplateService) {
        super(injector);
        this.initFilter();
        this.inputModel = new ReportAssDelivery();
        this.inputModel.branchLogin = this.appSession.user.subbrId;
        this.inputModel.reportStatus = 'N,E';
        // COMMENT: this.stopAutoUpdateView();
    }

    initFilter() {

    }


    ngOnInit(): void {
        // this.appToolbar.setRole('AssDelivery', false, false, false, false, false, false, false, false);

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

        let filterReport = { ...this.inputModel }

        reportInfo.parameters = [];


        var date = moment();
        reportInfo.values = [];

        reportInfo.values.push(this.GetParamNameAndValue("A3", "ĐƠN VỊ: " + this.inputModel.branchName));
        reportInfo.values.push(this.GetParamNameAndValue("A4", "Ngày " + date.date() + " tháng " + (date.month() + 1) + " năm " + date.year()));
        reportInfo.values.push(this.GetParamNameAndValue("A6", "Đơn vị sử dụng: " + this.inputModel.branchName));

        reportInfo.parameters = [];
        reportInfo.parameters.push(this.GetParamNameAndValue("DATE", moment(this.inputModel.exportDate, 'DD/MM/YYYY').format('DD/MM/YYYY')));
        reportInfo.parameters.push(this.GetParamNameAndValue("BRANCH_ID", this.inputModel.branhId));
        reportInfo.parameters.push(this.GetParamNameAndValue("LEVEL", "ALL"));
        reportInfo.parameters.push(this.GetParamNameAndValue("DEP_ID", this.inputModel.departmentId));
        reportInfo.parameters.push(this.GetParamNameAndValue("REPORT_STATUS", this.inputModel.reportStatus));
        reportInfo.parameters.push(this.GetParamNameAndValue("BRANCH_LOGIN", this.appSession.user.subbrId));

        reportInfo.pathName = "/ASS_MASTER/TSCD_BC16B.xlsx";
        reportInfo.storeName = "rpt_TSCD_BC016_2";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.isShowError = false;
            this.updateView();
        });
    }
    onSelectBranch(event: CM_BRANCH_ENTITY) {
        if (event.fatheR_ID) {
            this.hidden = false;
        }
        else {
            this.hidden = true;
        }
        this.inputModel.branchName = event.brancH_NAME;
        this.inputModel.branhId = event.brancH_ID;
        this.updateView();
    }
    onSelectDep(event: CM_DEPARTMENT_ENTITY) {
        if (this.hidden) {
            this.inputModel.departmentId = "";
            this.inputModel.departmentName = "";

        }
        else {
            this.inputModel.departmentId = event.deP_ID;
            this.inputModel.departmentName = event.deP_NAME;
        }
        this.inputModel.departmentId = event.deP_ID;
        this.inputModel.departmentName = event.deP_NAME;
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

        values.push(this.GetParamNameAndValue("BranchCode", this.appSession.user.branchCode));
        values.push(this.GetParamNameAndValue("BranchName", this.appSession.user.branchName));

        values.push(this.GetParamNameAndValue("ReportDate", "Ngày " + date.date() + " tháng " + (date.month() + 1) + " năm " + date.year()));
        values.push(this.GetParamNameAndValue("UserName", this.appSession.user.name));
        values.push(this.GetParamNameAndValue("PrintDate", moment(this.inputModel.exportDate, 'DD/MM/YYYY').format('DD/MM/YYYY')));
        values.push(this.GetParamNameAndValue("ReportCode", "TSCD_BC16B"));

        var parameters = [];
        parameters.push(this.GetParamNameAndValue("DATE", moment(this.inputModel.exportDate, 'DD/MM/YYYY').format('DD/MM/YYYY')));
        parameters.push(this.GetParamNameAndValue("BRANCH_ID", this.inputModel.branhId));
        parameters.push(this.GetParamNameAndValue("LEVEL", "ALL"));
        parameters.push(this.GetParamNameAndValue("DEP_ID", this.inputModel.departmentId));
        parameters.push(this.GetParamNameAndValue("REPORT_STATUS", this.inputModel.reportStatus));
        parameters.push(this.GetParamNameAndValue("BRANCH_LOGIN", this.appSession.user.subbrId));


        this._previewTemplateService.printReportTemplate("TSCD_BC16B", parameters, values);
        // this.previewTemplateModal.show("TSCD_BC16B", parameters, values);

        this.showSuccessMessage(this.l('ExportFileSuccess'));
        this.isShowError = false;
        this.updateView();
    }

}
